import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const About = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true,
        adaptiveHeight: true,
        className: 'photo-slider'
    };

    return (
        <div id="about-section" className="py-20 px-4 sm:px-8 bg-white">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="text-gray-700">
                    <h2 className="text-4xl font-bold text-amber-900 mb-4">Hakkımızda</h2>
                    <p className="mb-4">
                        Oktay Saç Tasarım olarak, yılların verdiği tecrübe ve sanatsal bakış açımızla sizlere en iyi hizmeti sunmaktan gurur duyuyoruz. Misyonumuz, her müşterimizin kendini özel ve yenilenmiş hissetmesini sağlamaktır. Salonumuzda kullandığımız yüksek kaliteli ürünler ve modern tekniklerle, tarzınıza en uygun saç kesimini, renklendirmeyi ve bakımı sunuyoruz.
                    </p>
                    <p>
                        Sıcak ve samimi bir ortamda, profesyonel ekibimizle tanışmak ve size özel hizmetlerimizden yararlanmak için randevunuzu bugün alın.
                    </p>
                </div>
                <div className="w-full max-w-md mx-auto">
                    <Slider {...settings}>
                        <div>
                            <img src="/oktayberber5.png" alt="Oktay Berber 5" className="rounded-lg shadow-lg w-full h-96 object-cover" />
                        </div>
                    </Slider>
                </div>
            </div>
        </div>
    );
};

export default About; 