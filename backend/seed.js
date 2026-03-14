const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const FormData = require('form-data'); // Need to install this

const imageFiles = [
    'C:\\Users\\User\\.gemini\\antigravity\\brain\\403a076b-491e-441d-9b2a-a1ad2ed4f7ef\\example_ad_1_1772778869777.png',
    'C:\\Users\\User\\.gemini\\antigravity\\brain\\403a076b-491e-441d-9b2a-a1ad2ed4f7ef\\example_ad_3_1772778897196.png',
    'C:\\Users\\User\\.gemini\\antigravity\\brain\\403a076b-491e-441d-9b2a-a1ad2ed4f7ef\\example_ad_5_1772779009591.png'
];

const videoUrls = [
    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
];

async function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const file = fs.createWriteStream(dest);
        protocol.get(url, (response) => {
            // Follow redirects
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                file.close();
                return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
            }

            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

async function uploadToSlot(slot, filePath, title) {
    return new Promise((resolve, reject) => {
        const form = new FormData();
        form.append('media', fs.createReadStream(filePath));
        form.append('title', title);

        const request = http.request({
            method: 'post',
            host: 'localhost',
            port: 4000,
            path: `/api/ads/${slot}`,
            headers: form.getHeaders()
        });

        form.pipe(request);

        request.on('response', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log(`✅ Uploaded to slot ${slot}`);
                    resolve(data);
                } else {
                    console.error(`❌ Failed to slot ${slot}: ${data}`);
                    reject(new Error(data));
                }
            });
        });

        request.on('error', reject);
    });
}

async function run() {
    console.log('Seeding data...');

    // Upload images to slots 1, 3, 5
    await uploadToSlot(1, imageFiles[0], 'Energy Drink Ad');
    await uploadToSlot(3, imageFiles[1], 'Luxury Watch Ad');
    await uploadToSlot(5, imageFiles[2], 'Vacation Ad');

    // Download and upload videos to slots 2, 4, 6
    for (let i = 0; i < 3; i++) {
        const slot = (i + 1) * 2; // 2, 4, 6
        const tmpPath = path.join(__dirname, `tmp_video_${slot}.mp4`);
        console.log(`Downloading video for slot ${slot}...`);
        try {
            await downloadFile(videoUrls[i], tmpPath);
            await uploadToSlot(slot, tmpPath, `Video Ad ${slot}`);
            fs.unlinkSync(tmpPath); // cleanup
        } catch (e) {
            console.error(`Error with video ${slot}:`, e.message);
        }
    }

    console.log('Done!');
}

run();
