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
        <div id="about-section" className="py-20 px-4 sm:px-8 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="text-dark-200">
                    <h2 className="text-4xl font-bold text-dark-100 mb-4">Hakkımızda</h2>
                    <p className="mb-4 text-dark-300 leading-relaxed">
                        Oktay Saç Tasarım olarak, yılların verdiği tecrübe ve sanatsal bakış açımızla sizlere en iyi hizmeti sunmaktan gurur duyuyoruz. Misyonumuz, her müşterimizin kendini özel ve yenilenmiş hissetmesini sağlamaktır. Salonumuzda kullandığımız yüksek kaliteli ürünler ve modern tekniklerle, tarzınıza en uygun saç kesimini, renklendirmeyi ve bakımı sunuyoruz.
                    </p>
                    <p className="text-dark-300 leading-relaxed">
                        Sıcak ve samimi bir ortamda, profesyonel ekibimizle tanışmak ve size özel hizmetlerimizden yararlanmak için randevunuzu bugün alın.
                    </p>
                </div>
                <div className="w-full max-w-md mx-auto">
                    <Slider {...settings}>
                        <div>
                            <img src="/oktayberber5.png" alt="Oktay Berber 5" className="rounded-lg shadow-2xl w-full h-96 object-cover border border-dark-600" />
                        </div>
                    </Slider>
                </div>
            </div>
        </div>
    );
};

export default About; 