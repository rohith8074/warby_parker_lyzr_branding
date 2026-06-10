const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const products = [
    { name: "Alston", color: "Violetwood" },
    { name: "Kemper", color: "Blue Marblewood" },
    { name: "Dex", color: "Marine Teal" },
    { name: "Werner", color: "Rose Water" },
    { name: "Matilda", color: "Smoky Mauve" },
    { name: "Scully", color: "Rose Water" }
];

async function run() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    const results = {};

    for (const prod of products) {
        console.log(`Searching for ${prod.name} ${prod.color}...`);
        const query = `site:warbyparker.com/eyeglasses ${prod.name} ${prod.color}`;
        await page.goto(`https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`);
        
        // Find product URL
        const prodUrl = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a.result__url'));
            for (let link of links) {
                if (link.href.includes('warbyparker.com/eyeglasses/')) {
                    return link.href;
                }
            }
            return null;
        });

        if (prodUrl) {
            console.log(`Found product URL: ${prodUrl}`);
            await page.goto(prodUrl, { waitUntil: 'networkidle2', timeout: 30000 }).catch(e => console.log(e.message));
            
            const imgSrc = await page.evaluate(() => {
                const imgs = Array.from(document.querySelectorAll('img'));
                for (let img of imgs) {
                    if (img.src && img.src.includes('img.warbyparker.com') && img.src.includes('width=')) {
                        return img.src;
                    }
                }
                return null;
            });

            if (imgSrc) {
                results[prod.name] = imgSrc;
                console.log(`-> Image: ${imgSrc}`);
            } else {
                console.log(`-> No image found on page.`);
            }
        } else {
            console.log(`-> No product URL found.`);
        }
    }

    await browser.close();
    
    const fs = require('fs');
    fs.writeFileSync('scraped_images.json', JSON.stringify(results, null, 2));
    console.log("\nFinished. Results saved to scraped_images.json");
}

run().catch(console.error);
