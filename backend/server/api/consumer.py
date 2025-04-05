import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
# from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import AccessToken
from .models import UserTherapistChatModel, BookingModel
from django.contrib.auth import get_user_model

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.room_group_name = f'chat_{self.session_id}'

        # Get token from query string
        # query_string = self.scope.get('query_string', b'').decode('utf-8')
        # token_param = [param for param in query_string.split('&') if param.startswith('token=')]
        token = self.scope["query_string"].decode().split("token=")[-1]

        if not token:
            # No token provided, close connection
            await self.close()
            return

        # token = token_param[0].split('=')[1]

        # Validate token
        try:
            # Decode the token
            access_token = AccessToken(token)
            user_id = access_token['user_id']

            # Save user info to scope
            self.scope['user_id'] = user_id
            self.user = await self.get_user(user_id)

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
        except Exception as e:
            print(f"WebSocket authentication error: {e}")
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
            data = json.loads(text_data)
            message_type = data.get('message_type')

            if message_type == 'chat_message':
                # Save message to database
                message_id = await self.save_message(data)

                # Send message to room group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': data.get('message'),
                        'sender': data.get('sender'),
                        'session_id': self.session_id,
                        'message_id': message_id,
                        'timestamp': data.get('timestamp', '')
                    }
                )
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

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message_type': 'chat_message',
            'message': event['message'],
            'sender': event['sender'],
            'session_id': event['session_id'],
            'message_id': event['message_id'],
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
            date = data.get('date')
            time = data.get('curr_time')
            session_id = self.session_id

            # Get session
            try:
                session = BookingModel.objects.get(id=session_id)
                print(f"Session found: {session_id}")
            except BookingModel.DoesNotExist:
                print(f"Session not found: {session_id}")
                return None

            print(f"Sender role: {sender}")

            try:
                chat = UserTherapistChatModel.objects.get(session_id=session)
            except UserTherapistChatModel.DoesNotExist:
                print("Session is not created")
                return None

            if sender == 'therapist':
                # Handle therapist message
                therapist_id = data.get('therapist_id')

                try:
                    therapist = User.objects.get(id=therapist_id)
                except User.DoesNotExist:
                    print(f"user with ID {therapist_id} does not exists")
                    return None

                # chat = UserTherapistChatModel.objects.filter(session_id=session).first()

                chat.messages.append(
                    {"sender": sender, "message": message, "date": date, "time": time})

                chat.save()

                return chat.id

            else:
                # Handle user message
                user_id = data.get('user_id')

                chat.messages.append(
                    {"sender": sender, "message": message, "date": date, "time": time})

                chat.save()

                return chat.id
        except Exception as e:
            print(f"Error saving message: {e}")
            return None
