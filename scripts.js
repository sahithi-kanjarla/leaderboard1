// URL of the CSV file on your cloud storage
const csvFileUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ1XvSpD9HkTt-cfalgF8SHJ14g7Pq0Mz3j9_Kzw7ZazWPotBZoJ6pmZAMGTQcLarfF8HsywTfrxSaQ/pub?output=csv'; // Replace with your actual URL

let leaderboardData = []; // Global variable to store the fetched leaderboard data

// Function to dynamically populate leaderboard from CSV data
function populateLeaderboard(data) {
    leaderboardData = data; // Store the data for search functionality
    let tableBody = document.querySelector('#leaderboard tbody');
    tableBody.innerHTML = '';  // Clear any existing rows

    let badgesCompletedCount = 0;
    let gamesCompletedCount = 0;

    // Check the structure of the data
    console.log('Parsed CSV Data:', data);

    // Sort data based on total points (skill badges + arcade games)
    data.sort((a, b) => {
        const totalA = parseInt(a['# of Skill Badges Completed']) + parseInt(a['# of Arcade Games Completed']);
        const totalB = parseInt(b['# of Skill Badges Completed']) + parseInt(b['# of Arcade Games Completed']);
        return totalB - totalA; // Sort in descending order
    });

    let currentRank = 1;
    let previousTotal = null;
    let rankOffset = 0;

    // Populate leaderboard rows
    data.forEach((item, index) => {
        const skillBadges = parseInt(item['# of Skill Badges Completed']) || 0;
        const arcadeGames = parseInt(item['# of Arcade Games Completed']) || 0;
        const total = skillBadges + arcadeGames;

        // Assign rank: if total score is the same as previous, same rank, otherwise increase rank
        if (total !== previousTotal) {
            currentRank = index + 1 - rankOffset;
        } else {
            rankOffset++;
        }
        previousTotal = total;

        if (skillBadges === 15) badgesCompletedCount++;
        if (arcadeGames >= 1) gamesCompletedCount++;

        // Prepare special badges images
        const specialBadges = item['Special Badges'] ? item['Special Badges'].split(',') : []; // Assuming badges are comma-separated
        const badgeImages = specialBadges.map(badge => {
            const trimmedBadge = badge.trim();
            return trimmedBadge ? `<img src="${trimmedBadge}.png" class="special-badge" alt="${trimmedBadge} Badge">` : ''; // Generate img tag
        }).join(''); // Join the images into a single string

        // Assign emojis for the top 3 ranks
        let rankDisplay;
        if (currentRank === 1) {
            rankDisplay = '🥇'; // Gold medal for rank 1
        } else if (currentRank === 2) {
            rankDisplay = '🥈'; // Silver medal for rank 2
        } else if (currentRank === 3) {
            rankDisplay = '🥉'; // Bronze medal for rank 3
        } else {
            rankDisplay = currentRank; // Display numeric rank for others
        }

        let row = `<tr>
            <td class="rank">${rankDisplay}</td>
            <td>${item['User Name'] || 'N/A'}</td>
            <td>${item['Access Code Redemption Status'] || 'N/A'}</td>
            <td><span class="${(skillBadges + arcadeGames === 16) ? 'yes' : 'no'}">${(skillBadges + arcadeGames === 16) ? 'Yes' : 'No'}</span></td>
            <td>${skillBadges}</td>
            <td>${arcadeGames}</td>
            <td>${badgeImages || ''}</td>
        </tr>`;
        tableBody.innerHTML += row;
    });

    // Update the info boxes
    document.getElementById('badgesCompleted').innerText = `People Completed All 15 Badges: ${badgesCompletedCount}`;
    document.getElementById('gamesCompleted').innerText = `People Completed Arcade Game: ${gamesCompletedCount}`;
}

// Fetch CSV and parse it
function fetchAndParseCSV() {
    Papa.parse(csvFileUrl, {
        download: true,
        header: true,
        complete: function(results) {
            console.log(results.data);  // Check CSV data in the console
            populateLeaderboard(results.data);
        },
        error: function(error) {
            console.error('Error fetching CSV:', error);  // Log any errors
            alert('Failed to load the leaderboard data. Please try again later.');  // Notify the user
        }
    });
}

// Function to filter the leaderboard based on search input
function filterTable() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const filteredData = leaderboardData.filter(item => {
        return (
            item['User Name'] && item['User Name'].toLowerCase().includes(input) // Only filtering by Name now
        );
    });
    
    populateLeaderboard(filteredData); // Repopulate the leaderboard with filtered data
}

// Fetch the CSV file and populate leaderboard when the page loads
document.addEventListener('DOMContentLoaded', fetchAndParseCSV);
