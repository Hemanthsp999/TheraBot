import Bot from './images/Bot.jpeg';
import { Typography } from "@material-tailwind/react";
import './css/App.css';

export default function Footer() {
  return (
    <footer className="footer w-full bg-gray-900 p-6">
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center sm:justify-between gap-6 text-center w-full">
        <img
          src={Bot}
          alt="logo-ct"
          className="w-12 rounded-full mx-4 m-3"
        />
        <ul className="flex flex-col sm:flex-row flex-wrap items-center gap-y-2 gap-x-6">
          {["About Us", "License", "Contribute", "Contact Us"].map((item, index) => (
            <li key={index}>
              <Typography
                as="a"
                href="#"
                color="blue-gray"
                className="font-normal transition-colors hover:text-blue-500 focus:text-blue-500"
              >
                {item}
              </Typography>
            </li>
          ))}
        </ul>
      </div>
      <hr className="my-4 border-gray-700" />
      <Typography color="blue-gray" className="text-center font-normal">
        &copy; {new Date().getFullYear()} TheraBot 
      </Typography>
    </footer>
  );
}

