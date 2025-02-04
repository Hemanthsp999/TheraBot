import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import carsouel1 from './images/Carsouel1.jpg';
import carsouel2 from './images/Carsouel2.jpg';
import carsouel3 from './images/Carsouel.webp';
import carsouel from './images/Bot_Human.png';
import Carsouel5 from './images/stress.jpg';

const Home = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        arrows: true
    };

    return (
        <>
            <div className="w-screen md:px-4  max-w-screen-xl mx-auto px-4 overflow-hidden" style={{marginTop: "50px"}}>
                <Slider {...settings} className="w-full">
                    <div className="flex justify-center">
                        <img className="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 h-auto rounded-lg mx-auto" src={carsouel} alt="Slide 1" />
                    </div>
                    <div className="flex justify-center">
                        <img className="w-full w-10 md:w-3/4 lg:w-2/3 xl:w-1/2 h-auto rounded-lg mx-auto" src={carsouel1} alt="Slide 2" />
                    </div>
                    <div className="flex justify-center">
                        <img className="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 h-auto rounded-lg mx-auto" src= {carsouel2}alt="Slide 3" />
                    </div>
                    <div className="flex justify-center">
                        <img className="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 h-auto rounded-lg mx-auto" src= {carsouel3}alt="Slide 4" />
                    </div>
                    <div className="flex justify-center">
                        <img className="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 h-auto rounded-lg mx-auto" src={Carsouel5} alt="Slide 5" />
                    </div>
                </Slider>
            </div>
        </>
    );
};

export default Home;

