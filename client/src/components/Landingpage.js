import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Bot from './images/Bot.jpeg';

const Home = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true
    };

    return (
    <>
        <div className="w-full md:px-4  max-w-screen-xl mx-auto px-4 overflow-hidden" style={{marginTop: "50px"}}>
            <Slider {...settings} className="w-full">
                <div className="flex justify-center">
                    <img className="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 h-auto rounded-lg mx-auto" src={Bot} alt="Slide 1" />
                </div>
                <div className="flex justify-center">
                    <img className="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 h-auto rounded-lg mx-auto" src={Bot} alt="Slide 2" />
                </div>
                <div className="flex justify-center">
                    <img className="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 h-auto rounded-lg mx-auto" src="/docs/images/carousel/carousel-3.svg" alt="Slide 3" />
                </div>
                <div className="flex justify-center">
                    <img className="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 h-auto rounded-lg mx-auto" src="/docs/images/carousel/carousel-4.svg" alt="Slide 4" />
                </div>
                <div className="flex justify-center">
                    <img className="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 h-auto rounded-lg mx-auto" src="/docs/images/carousel/carousel-5.svg" alt="Slide 5" />
                </div>
            </Slider>
        </div>
        <div>
                <p>laksdjf</p>
        </div>
        </>
    );
};

export default Home;

