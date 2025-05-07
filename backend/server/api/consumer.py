import json
import pytz
from datetime import date, datetime
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from .models import UserTherapistChatModel, BookingModel
from django.contrib.auth import get_user_model
import traceback

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.room_group_name = f'chat_{self.session_id}'
        self.india = pytz.timezone("Asia/Kolkata")

        # Get token from query string
        token_param = self.scope["query_string"].decode()
        if "token=" in token_param:
            token = token_param.split("token=")[-1]
        else:
            print("No token provided in WebSocket connection")
            await self.close()
            return

        # Log connection attempt
        print(f"WebSocket connection attempt for session {self.session_id}")

        # Validate token
        try:
            # Decode the token
            access_token = AccessToken(token)
            user_id = access_token['user_id']

            # Save user info to scope
            self.scope['user_id'] = user_id
            self.user = await self.get_user(user_id)

            if not self.user:
                print(f"User {user_id} not found")
                await self.close()
                return

            print(f"User {user_id} ({self.user.email}) authenticated successfully")

            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()

            # Notify group about user connecting (online status)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'status_update',
                    'user_id': user_id,
                    'status': 'online',
                    'session_id': self.session_id
                }
            )
            print(f"Connection established for session {self.session_id}")
        except Exception as e:
            print(f"WebSocket authentication error: {e}")
            traceback.print_exc()
            await self.close()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        # Notify group about user disconnecting (offline status)
        try:
            user_id = self.scope.get('user_id')
            if user_id:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'status_update',
                        'user_id': user_id,
                        'status': 'offline',
                        'session_id': self.session_id
                    }
                )
        except Exception as e:
            print(f"Error sending disconnect notification: {e}")

    async def receive(self, text_data):
        try:
            print(f"Received WebSocket message: {text_data}")
            data = json.loads(text_data)
            message_type = data.get('message_type')

            if message_type == 'chat_message':
                # Enhanced logging
                print(f"Processing chat message: {data.get('message')} from {data.get('sender')}")

                # Save message to database
                message_id = await self.save_message(data)

                if message_id:
                    print(f"Message saved successfully with ID: {message_id}")
                    # Prepare timestamp
                    timestamp = data.get('timestamp', datetime.now().isoformat())

                    # Send message to room group
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'chat_message',
                            'message': data.get('message'),
                            'sender': data.get('sender'),
                            'session_id': self.session_id,
                            'message_id': message_id,
                            'time': data.get('curr_time', datetime.now(self.india).strftime("%H:%M:%S")),
                            'timestamp': timestamp
                        }
                    )
                else:
                    print("Failed to save message to database")
            elif message_type == 'typing':
                # Send typing notification to room group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'typing_notification',
                        'user_id': self.scope.get('user_id'),
                        'is_typing': data.get('is_typing', False),
                        'session_id': self.session_id
                    }
                )
        except Exception as e:
            print(f"Error processing WebSocket message: {e}")
            traceback.print_exc()

    async def chat_message(self, event):
        # Send message to WebSocket
        print(f"Sending message to client: {event['message']}")
        await self.send(text_data=json.dumps({
            'message_type': 'chat_message',
            'message': event['message'],
            'sender': event['sender'],
            'session_id': event['session_id'],
            'message_id': event['message_id'],
            'time': event.get('time', ''),
            'timestamp': event['timestamp']
        }))

    async def status_update(self, event):
        # Send status update to WebSocket
        await self.send(text_data=json.dumps({
            'message_type': 'status_update',
            'user_id': event['user_id'],
            'status': event['status'],
            'session_id': event['session_id']
        }))

    async def typing_notification(self, event):
        # Send typing notification to WebSocket
        await self.send(text_data=json.dumps({
            'message_type': 'typing',
            'user_id': event['user_id'],
            'is_typing': event['is_typing'],
            'session_id': event['session_id']
        }))

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def save_message(self, data):
        try:
            message = data.get('message')
            sender = data.get('sender')
            session_id = self.session_id
            current_date = date.today().isoformat()
            current_time = datetime.now(self.india).strftime("%H:%M:%S")

            # Use provided date/time if available
            message_date = data.get('date', current_date)
            message_time = data.get('curr_time', current_time)

            print(f"Saving message - Session: {session_id}, Sender: {sender}, Date: {message_date}")

            # Get session - make sure this is the right session model
            try:
                session = BookingModel.objects.get(id=session_id)
                print(f"Session: {session}")
                print(f"Session found: {session_id}")
            except BookingModel.DoesNotExist:
                print(f"Session not found: {session_id}")
                return None

            # Try to get existing chat or create a new one
            try:
                chat = UserTherapistChatModel.objects.get(session_id=session)
                print(f"Existing chat found for session {session_id}")
            except UserTherapistChatModel.DoesNotExist:
                print(f"No chat found for session {session_id}, creating new chat")
                # Create a new chat for this session
                chat = UserTherapistChatModel(
                    session_id=session,
                    messages=[]  # Initialize with empty message list
                )
                chat.save()

            # Determine user IDs based on sender type
            user_id = None
            therapist_id = None

            if sender == 'therapist':
                therapist_id = data.get('therapist_id')
                if not therapist_id:
                    print("No therapist_id provided in therapist message")
                    return None
            elif sender == 'user':
                user_id = data.get('user_id')
                if not user_id:
                    user_id = self.scope.get('user_id')  # Fallback to authenticated user

            # Prepare message object
            message_object = {
                "sender": sender,
                "message": message,
                "date": message_date,
                "time": message_time
            }

            # Add user/therapist IDs if available
            if user_id:
                message_object["user_id"] = user_id
            if therapist_id:
                message_object["therapist_id"] = therapist_id

            print(f"Adding message to chat: {message_object}")

            # Append the message
            if not chat.messages:
                chat.messages = [message_object]
            else:
                chat.messages.append(message_object)

            chat.save()
            print(f"Message saved successfully for session {session_id}")
            return chat.id

        except Exception as e:
            print(f"Error saving message: {e}")
            traceback.print_exc()
            return None
