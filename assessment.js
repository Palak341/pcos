let currentQuestionIndex = 0;
const responses = {};

const questions = [
    {
        type: "dates",
        question: "What were the dates of your last three menstrual periods?",
        subfields: ["Most Recent", "Previous", "Third Most Recent"]
    },
    {
        type: "scale",
        question: "How would you rate the amount of excessive hair growth on your body (e.g., face, chest, back)?",
        options: [1, 2, 3, 4, 5],
        labels: ["None", "Mild", "Moderate", "Severe", "Very Severe"]
    },
    {
        type: "scale",
        question: "How would you rate the severity of acne or oily skin?",
        options: [1, 2, 3, 4, 5],
        labels: ["None", "Mild", "Moderate", "Severe", "Very Severe"]
    },
    {
        type: "scale",
        question: "How noticeable is your hair thinning or male-pattern baldness?",
        options: [1, 2, 3, 4, 5],
        labels: ["None", "Mild", "Moderate", "Severe", "Very Severe"]
    },
    {
        type: "measurements",
        question: "What is your height and weight?",
        fields: [
            { label: "Height", type: "number", unit: ["cm", "inches"] },
            { label: "Weight", type: "number", unit: ["kg", "pounds"] }
        ]
    },
    {
        question: "Have you noticed skin darkening in body folds?",
        type: "yesno",
        help: "Common areas include neck folds, groin, or underarms"
    },
    
    {
        type: "yesno",
        question: "Is there a history of PCOS or diabetes in your family?"
    }
    ]

const questionContainer = document.getElementById('question-container');
const progressBar = document.getElementById('progress-bar');
const prevButton = document.getElementById('prev-btn');
const nextButton = document.getElementById('next-btn');

document.addEventListener('DOMContentLoaded', () => {
    loadQuestion(currentQuestionIndex);
    updateNavigationButtons();
});

prevButton.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion(currentQuestionIndex);
        updateNavigationButtons();
    }
});

nextButton.addEventListener('click', () => {
    if (currentQuestionIndex < questions.length - 1) {
        saveResponse();
        currentQuestionIndex++;
        loadQuestion(currentQuestionIndex);
    } else {
        saveResponse();
        submitAssessment();
    }
    updateNavigationButtons();
});

function saveResponse() {
    const question = questions[currentQuestionIndex];
    switch(question.type) {
        case "dates":
            responses[currentQuestionIndex] = question.subfields.reduce((acc, field) => {
                const inputName = `period_${field.toLowerCase().replace(' ', '_')}`;
                acc[field] = document.querySelector(`input[name="${inputName}"]`).value;
                return acc;
            }, {});
            break;
        case "scale":
            responses[currentQuestionIndex] = document.querySelector('input[name="response"]:checked')?.value;
            break;
        case "measurements":
            responses[currentQuestionIndex] = question.fields.reduce((acc, field) => {
                const value = document.querySelector(`input[name="${field.label.toLowerCase()}"]`).value;
                const unit = document.querySelector(`select[name="${field.label.toLowerCase()}_unit"]`).value;
                acc[field.label] = { value, unit };
                return acc;
            }, {});
            break;
        case "yesno":
            responses[currentQuestionIndex] = document.querySelector('input[name="response"]:checked')?.value;
            break;
    }
}

function updateNavigationButtons() {
    prevButton.disabled = currentQuestionIndex === 0;
    nextButton.textContent = currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next';
}

function submitAssessment() {
    if (!validateAllResponses()) {
        alert("Please complete all measurements");
        return;
    }
    
    console.log("Submitting responses:", responses);
    window.location.href = `results.html?data=${encodeURIComponent(JSON.stringify(responses))}`;
}

function validateAllResponses() {
    const measurementResponses = responses[6]; 
    if (!measurementResponses?.Waist?.value || !measurementResponses?.Hip?.value) {
        return false;
    }
    return true;
}

function loadQuestion(index) {
    const questionData = questions[index];
    let html = `<div class="question-card">
                    <h2>${questionData.question}</h2>`;

    switch(questionData.type) {
        case "dates":
            html += `<div class="dates-container">
                ${questionData.subfields.map(field => `
                    <div class="date-field">
                        <label>${field}</label>
                        <input type="date" name="period_${field.toLowerCase().replace(' ', '_')}">
                    </div>
                `).join('')}
            </div>`;
            break;

        case "scale":
            html += `
            <div class="scale-container">
                <div class="scale-options">
                    ${questionData.options.map((value, i) => `
                        <label class="scale-option">
                            <input type="radio" name="response" value="${value}">
                            <span class="scale-value">${value}</span>
                            <span class="scale-label">${questionData.labels[i]}</span>
                        </label>
                    `).join('')}
                </div>
            </div>`;
            if (questionData.question.includes("excessive hair growth") || questionData.question.includes("acne") || questionData.question.includes("baldness")) {
                html += `
                <div class="camera-container">
                    <video id="camera" autoplay></video>
                    <button onclick="takePhoto()">Capture Image</button>
                    <canvas id="photoCanvas" style="display:none;"></canvas>
                    <img id="photoPreview" src="" alt="Photo Preview" style="display:none;">
                    <p class="note">Note: Images are used only for analysis and not stored permanently.</p>
                </div>`;
            }
            break;

        case "measurements":
            html += `<div class="measurements-container">
                ${questionData.fields.map(field => `
                    <div class="measurement-field">
                        <label>${field.label}</label>
                        <input type="number" name="${field.label.toLowerCase()}" step="0.1" oninput="calculateBMI()">
                        <select name="${field.label.toLowerCase()}_unit">
                            ${field.unit.map(u => `<option value="${u}">${u}</option>`).join('')}
                        </select>
                    </div>
                `).join('')}
            </div>`;
            html += `<div id="bmi-result" class="bmi-result">BMI: --</div>`;
            break;

        case "yesno":
            html += `<div class="yesno-container">
                <label><input type="radio" name="response" value="yes">Yes</label>
                <label><input type="radio" name="response" value="no">No</label>
            </div>`;
            if (questionData.question.includes("skin darkening")) {
                html += `
                <div class="camera-container">
                    <video id="camera" autoplay></video>
                    <button onclick="takePhoto()">Capture Image</button>
                    <canvas id="photoCanvas" style="display:none;"></canvas>
                    <img id="photoPreview" src="" alt="Photo Preview" style="display:none;">
                    <p class="note">Note: Images are used only for analysis and not stored permanently.</p>
                </div>`;
            }
            break;
    }

    html += `</div>`;
    questionContainer.innerHTML = html;

    if (questionData.question.includes("excessive hair growth") || questionData.question.includes("acne") || questionData.question.includes("baldness")) {
        startCameraWithFaceOutline();
    }

    if (questionData.question.includes("skin darkening")) {
        startCameraWithCircularOutline();
    }

    progressBar.style.width = `${((index + 1) / questions.length) * 100}%`;
}


function startCameraWithFaceOutline() {
    const video = document.getElementById('camera');
    navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
        .then(stream => {
            video.srcObject = stream;
            video.addEventListener('play', () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const context = canvas.getContext('2d');
                document.querySelector('.camera-container').appendChild(canvas);

                setInterval(() => {
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    context.beginPath();
                    context.rect(canvas.width/3, canvas.height/4, canvas.width/3, canvas.height/2);
                    context.lineWidth = 3;
                    context.strokeStyle = 'green';
                    context.stroke();
                }, 500);
            });
        })
        .catch(err => {
            console.error("Camera access denied:", err);
        });

    const container = document.querySelector('.camera-container');
    container.style.position = 'relative';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.margin = 'auto';
}

function startCameraWithCircularOutline() {
    const video = document.getElementById('camera');
    navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
        .then(stream => {
            video.srcObject = stream;
            video.addEventListener('play', () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const context = canvas.getContext('2d');
                document.querySelector('.camera-container').appendChild(canvas);

                setInterval(() => {
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    context.beginPath();
                    context.arc(canvas.width / 2, canvas.height / 2, canvas.width / 4, 0, 2 * Math.PI);
                    context.lineWidth = 3;
                    context.strokeStyle = 'purple';
                    context.stroke();
                }, 500);
            });
        })
        .catch(err => {
            console.error("Camera access denied:", err);
        });

    const container = document.querySelector('.camera-container');
    container.style.position = 'relative';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.margin = 'auto';
}

function takePhoto() {
    const video = document.getElementById('camera');
    const canvas = document.getElementById('photoCanvas');
    const photoPreview = document.getElementById('photoPreview');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const photoUrl = canvas.toDataURL('image/png');
    photoPreview.src = photoUrl;
    photoPreview.style.display = 'block';
    responses['photo'] = photoUrl;
}

function calculateBMI() {
    const height = parseFloat(document.querySelector('input[name="height"]').value) / 100;
    const weight = parseFloat(document.querySelector('input[name="weight"]').value);
    if (height > 0 && weight > 0) {
        const bmi = (weight / (height * height)).toFixed(2);
        let category = '';
        if (bmi < 18.5) {
            category = 'Underweight';
        } else if (bmi >= 18.5 && bmi < 24.9) {
            category = 'Normal weight';
        } else if (bmi >= 25 && bmi < 29.9) {
            category = 'Overweight';
        } else {
            category = 'Obese';
        }
        document.getElementById('bmi-result').textContent = `BMI: ${bmi} (${category})`;
        document.getElementById('bmi-result').innerHTML += '<br><small>Underweight: <18.5, Normal: 18.5–24.9, Overweight: 25–29.9, Obese: ≥30</small>';
    } else {
        document.getElementById('bmi-result').textContent = "BMI: --";
    }
}


function startCameraWithFaceOutline() {
    const video = document.getElementById('camera');
    navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
        .then(stream => {
            video.srcObject = stream;
            video.addEventListener('play', () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const context = canvas.getContext('2d');
                document.querySelector('.camera-container').appendChild(canvas);

                setInterval(() => {
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    context.beginPath();
                    context.rect(canvas.width/3, canvas.height/4, canvas.width/3, canvas.height/2);
                    context.lineWidth = 3;
                    context.strokeStyle = 'red';
                    context.stroke();
                }, 500);
            });
        })
        .catch(err => {
            console.error("Camera access denied:", err);
        });

    // Center alignment with vertical layout
    const container = document.querySelector('.camera-container');
    container.style.position = 'relative';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.margin = 'auto';
}

function startCameraWithBaldnessOutline() {
    const video = document.getElementById('camera');
    navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
        .then(stream => {
            video.srcObject = stream;
            video.addEventListener('play', () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const context = canvas.getContext('2d');
                document.querySelector('.camera-container').appendChild(canvas);

                setInterval(() => {
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    context.beginPath();
                    context.rect(canvas.width/4, canvas.height/6, canvas.width/2, canvas.height/4);
                    context.lineWidth = 3;
                    context.strokeStyle = 'blue';
                    context.stroke();
                }, 500);
            });
        })
        .catch(err => {
            console.error("Camera access denied:", err);
        });

    // Center alignment with vertical layout
    const container = document.querySelector('.camera-container');
    container.style.position = 'relative';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.margin = 'auto';
}


function takePhoto() {
    const video = document.getElementById('camera');
    const canvas = document.getElementById('photoCanvas');
    const photoPreview = document.getElementById('photoPreview');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const photoUrl = canvas.toDataURL('image/png');
    photoPreview.src = photoUrl;
    photoPreview.style.display = 'block';
    responses['photo'] = photoUrl;

    const imageBlob = dataURItoBlob(photoUrl);
    uploadImageToServer(imageBlob);
}

function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

function uploadImageToServer(blob) {
    const formData = new FormData();
    formData.append('image', blob, 'photo.png');

    fetch('https://api.imgbb.com/1/upload?key=YOUR_IMGBB_API_KEY', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Image uploaded:', data.data.url);
        responses['photoUrl'] = data.data.url;
    })
    .catch(error => {
        console.error('Image upload failed:', error);
    });
}

loadQuestion(currentQuestionIndex);