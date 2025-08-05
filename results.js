function calculateRiskScore(features) {
    const weights = [0.2, 0.3, 0.1, 0.3, 0.1, 0.1, 0.3, 0.1, 0]; // Adjusted weights

    let riskScore = 0;

    for (let i = 0; i < features.length; i++) {
        riskScore += features[i] * weights[i];
        console.log(`Feature ${i}: ${features[i]}, Weight: ${weights[i]}, Contribution: ${features[i] * weights[i]}`);
    }

    console.log("Calculated Risk Score (Weighted Sum):", riskScore);
    return riskScore;
}

document.addEventListener("DOMContentLoaded", () => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const responseData = JSON.parse(urlParams.get('data'));
        console.log("Responses:", responseData);

        const features = processResponses(responseData);
        console.log("Features:", features);

        // Calculate risk score using weighted sum
        const riskScore = calculateRiskScore(features);
        console.log("Final Risk Score:", riskScore);

        const riskLevel = getRiskLevel(riskScore);
        const recommendations = getRecommendations(riskScore);

        displayResults(riskLevel, recommendations, riskScore);
    } catch (error) {
        console.error("Error processing results:", error);
        displayError();
    }
});

function getRiskLevel(score) {
    console.log("Evaluating risk level for score:", score); // Debugging statement
    if (score < 0.50) { // Adjusted threshold
        return {
            level: "Possibly At No Risk",
            color: "#4CAF50",
            description: "Your symptoms suggest a low likelihood of PCOS. Maintain a healthy lifestyle."
        };
    } else {
        return {
            level: "Possibly At Risk",
            color: "#FFC107",
            description: "Your symptoms suggest a potential risk of PCOS. Consider consulting a healthcare provider."
        };
    }
}

function processResponses(data) {
    if (!data || typeof data !== 'object') {
        console.warn("Invalid data structure");
        return Array(9).fill(0); // Adjusted to 9 features
    }

    const features = [
        calculatePeriodFeature(data[0]),     // Period irregularity (0-1)
        normalizeHirsutism(data[1]),         // Hirsutism (0-1)
        normalizeScale(data[2]),             // Acne (0-1)
        normalizeScale(data[3]),             // Hair loss (0-1)
        calculateBMIFeature(data[4]),        // BMI normalized
        validateYesNo(data[5]),              // Skin darkening
        calculateWHR(data[6]),               // WHR raw value
        validateYesNo(data[7]),              // Family history
        0                                    // Reserved
    ];

    console.log("Feature mapping:", {
        periodScore: features[0],
        hirsutism: features[1],
        acne: features[2],
        hairLoss: features[3],
        bmi: features[4],
        skinDarkening: features[5],
        whr: features[6],
        familyHistory: features[7]
    });

    return features;
}

function normalizeScale(value) {
    if (!value) return 0;
    const score = parseInt(value);
    return isNaN(score) ? 0 : ((score - 1) / 4); // Normalize 1-5 to 0-1
}

function calculateWHR(measurements) {
    console.log("WHR input:", measurements); // Debug log

    if (!measurements || !measurements.Waist || !measurements.Hip) {
        console.warn("Missing WHR measurements");
        return 0;
    }

    try {
        const waistValue = parseFloat(measurements.Waist.value);
        const hipValue = parseFloat(measurements.Hip.value);

        return waistValue / hipValue;
    } catch (error) {
        console.error("WHR calculation error:", error);
        return 0;
    }
}

function validateYesNo(value) {
    return value === 'yes' ? 1 : 0;
}

function normalizeHirsutism(value) {
    if (!value) {
        console.warn("Missing hirsutism score");
        return 0;
    }
    const score = parseInt(value);
    return isNaN(score) ? 0 : Math.min(score / 36, 1); // Normalize to 0-1 scale
}

function calculatePeriodFeature(dates) {
    if (!dates || !dates['Most Recent'] || !dates['Previous']) {
        console.log("Insufficient period data");
        return 0;
    }

    const cycleLengths = [];
    const weights = [];

    // Calculate first cycle (Most Recent to Previous)
    const recent = new Date(dates['Most Recent']);
    const previous = new Date(dates['Previous']);
    const firstCycle = Math.abs((recent - previous) / (1000 * 60 * 60 * 24));
    cycleLengths.push(firstCycle);
    weights.push(0.6); // More weight to recent cycle

    // Calculate second cycle if third date exists
    if (dates['Third Most Recent']) {
        const third = new Date(dates['Third Most Recent']);
        const secondCycle = Math.abs((previous - third) / (1000 * 60 * 60 * 24));
        cycleLengths.push(secondCycle);
        weights.push(0.4); // Less weight to older cycle
    }

    // Calculate weighted average of cycle variations
    let totalScore = 0;
    let totalWeight = 0;

    cycleLengths.forEach((cycle, index) => {
        const deviation = Math.abs(cycle - 28) / 28; // Normalize to 28-day cycle
        totalScore += deviation * weights[index];
        totalWeight += weights[index];
    });
    return totalWeight > 0 ? totalScore / totalWeight : 0;
}

function calculateBMIFeature(measurements) {
    if (!measurements?.Height?.value || !measurements?.Weight?.value) return 0;

    const heightM = measurements.Height.unit === 'inches'
        ? measurements.Height.value * 0.0254
        : measurements.Height.value / 100;

    const weightKg = measurements.Weight.unit === 'pounds'
        ? measurements.Weight.value * 0.453592
        : measurements.Weight.value;

    const bmi = weightKg / (heightM * heightM);
    return Math.min(Math.abs(bmi - 21.7) / 10, 1);
}

function getRecommendations(score) {
    if (score < 0.70) {
        return [
            "Maintain a healthy lifestyle",
            "Regular exercise",
            "Balanced diet",
            "Monitor menstrual cycles"
        ];
    } else if (score < 0.80) {
        return [
            "Schedule a check-up with your healthcare provider",
            "Keep a detailed menstrual calendar <a href='https://tampax.com/en-us/period-tracker/' target='_blank'>Period Tracker App</a>",
            "Consider lifestyle modifications <a href='https://www.healthline.com/health/womens-health/exercise-for-pcos' target='_blank'>Exercise & Diet for PCOS</a>",
            "Monitor symptoms closely"
        ];
    }
    return [
        "Consult with a healthcare provider soon",
        "Get hormonal levels tested",
        "Consider ultrasound examination",
        "Begin lifestyle modifications <a href='https://www.healthline.com/health/womens-health/exercise-for-pcos' target='_blank'>Exercise & Diet for PCOS</a>"
    ];
}

function displayResults(riskLevel, recommendations, riskScore) {
    const resultsSummary = document.getElementById("results-summary");
    const recommendationsList = document.getElementById("recommendations-list");

    if (resultsSummary && recommendationsList) {
        resultsSummary.innerHTML = `
            <h2 style="color: ${riskLevel.color}">${riskLevel.level}</h2>
            <p>${riskLevel.description}</p>
            <!-- Removed percentage display -->
        `;

        recommendationsList.innerHTML = recommendations
            .map(rec => `<li>${rec}</li>`)
            .join('');

        if (riskScore >= 0.80) {
            const searchLink = document.createElement('div');
            searchLink.className = 'doctor-search';
            searchLink.innerHTML = `
                <button onclick="findDoctors()" class="find-doctor-btn">
                    Find Gynecologists Near Me
                </button>
            `;
            resultsSummary.appendChild(searchLink);
        }
    }
}

function findDoctors() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            window.open(`https://www.google.com/search?q=gynecologist+near+me`, '_blank');
        });
    } else {
        window.open(`https://www.google.com/search?q=gynecologist+near+me`, '_blank');
    }
}

function displayError() {
    const resultsSummary = document.getElementById("results-summary");
    if (resultsSummary) {
        resultsSummary.innerHTML = `
            <h2 style="color: #F44336">Error Processing Results</h2>
            <p>There was an error processing your assessment. Please try again.</p>
        `;
    }
}