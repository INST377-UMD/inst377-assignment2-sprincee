let allBreeds = {};

document.addEventListener('DOMContentLoaded', function(){
    console.log('Dogs page loaded');

    loadRandomDogImages();
    loadDogBreeds();
    addDogBreedVoiceCommand();
});

async function loadRandomDogImages() {
    try {
        const carouselWrapper = document.querySelector('.slider-wrapper');

        carouselWrapper.innerHTML = '<div class="loading">Loading dog images...</div>';

        const imagePromises = [];

        for (let i = 0; i < 10; i++) {
            imagePromises.push(fetch('https://dog.ceo/api/breeds/image/random')
            .then(response => response.json())
            .then(data => data.message));
        }

        const imageUrls = await Promise.all(imagePromises);
        
        carouselWrapper.innerHTML = '';

        imageUrls.forEach(url => {
            const slide = document.createElement('div');
            slide.className = 'slide';
            
            const img = document.createElement('img');
            img.src = url;
            img.alt = 'Random Dog';
            
            slide.appendChild(img);
            carouselWrapper.appendChild(slide);
        });
        
        initializeCarousel();
        
    } catch (error) {
        console.error('Error loading dog images:', error);
        document.querySelector('.slider-wrapper').innerHTML = 
            '<div class="error-message" style="display:block;">Failed to load dog images. Please try refreshing the page.</div>';
    }
}

function initializeCarousel() {
    const carousel = document.getElementById('dog-carousel');
    
    if (typeof SimpleSlider !== 'undefined') {

        new SimpleSlider({
            container: carousel,
            delay: 5, 
            autoplay: true
        });
    } else {
        console.error('Simple Slider library not available. Using basic slider functionality.');
        
        const slides = carousel.querySelectorAll('.slide');
        if (slides.length > 0) {
            let currentSlide = 0;
            
            function showSlide(index) {
                slides.forEach(slide => slide.style.display = 'none');
                

                slides[index].style.display = 'flex';
            }
            
            showSlide(currentSlide);
            
            setInterval(() => {
                currentSlide = (currentSlide + 1) % slides.length;
                showSlide(currentSlide);
            }, 5000);
        }
    }
}

async function loadDogBreeds() {
    try {
        const breedsContainer = document.getElementById('breeds-buttons');
        
        breedsContainer.innerHTML = '<div class="loading">Loading dog breeds...</div>';
        
        const response = await fetch('https://api.thedogapi.com/v1/breeds');
        const breedsData = await response.json();
        
        breedsData.forEach(breed => {
            const breedName = breed.name.toLowerCase();
            allBreeds[breedName] = breed;
        });
        
        breedsContainer.innerHTML = '';
        
        breedsData.forEach(breed => {
            const button = document.createElement('button');
            button.className = 'breed-button';
            button.textContent = breed.name;
            
            button.addEventListener('click', () => showBreedInfo(breed));
            
            breedsContainer.appendChild(button);
        });
        
    } catch (error) {
        console.error('Error loading dog breeds:', error);
        document.getElementById('breeds-buttons').innerHTML = 
            '<div class="error-message" style="display:block;">Failed to load dog breeds. Please try refreshing the page.</div>';
    }
}

function showBreedInfo(breed) {
    document.getElementById('breed-name').textContent = breed.name;
    document.getElementById('breed-description').textContent = breed.temperament || 'No description available.';
    document.getElementById('min-life').textContent = breed.life_span ? breed.life_span.split(' - ')[0] : 'N/A';
    document.getElementById('max-life').textContent = breed.life_span ? breed.life_span.split(' - ')[1]?.replace(' years', '') || breed.life_span.split(' - ')[0] : 'N/A';
    
    document.getElementById('breed-info').style.display = 'block';
    
    document.getElementById('breed-info').scrollIntoView({ behavior: 'smooth' });
}

function addDogBreedVoiceCommand() {
    if (typeof annyang !== 'undefined') {
        const commands = {
            'load dog breed *breed': function(breed) {
                console.log('Load dog breed command recognized:', breed);
                const breedLower = breed.toLowerCase();
                
                let matchedBreed = allBreeds[breedLower];
                
                if (!matchedBreed) {
                    const breedKeys = Object.keys(allBreeds);
                    for (const key of breedKeys) {
                        if (key.includes(breedLower) || breedLower.includes(key)) {
                            matchedBreed = allBreeds[key];
                            break;
                        }
                    }
                }
                
                if (matchedBreed) {
                    showBreedInfo(matchedBreed);
                } else {
                    alert(`Sorry, couldn't find information about ${breed}. Please try another breed.`);
                }
            }
        };
        
        annyang.addCommands(commands);
    }
}