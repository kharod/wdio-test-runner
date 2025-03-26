import { browser } from '@wdio/globals';

describe('Example test suite', () => {
    before(async function() {
        console.log('Running setup for example test suite');
    });

    it('should navigate to Google', async () => {
        await browser.url('https://google.com');
        console.log('Navigated to Google');
        
        const title = await browser.getTitle();
        console.log(`Page title is: ${title}`);
        
        expect(title).toContain('Google');
    });

    it('should search for WebdriverIO', async () => {
        const searchInput = await $('input[name="q"]');
        await searchInput.setValue('WebdriverIO');
        await browser.keys('Enter');
        
        console.log('Searching for WebdriverIO');
        await browser.pause(1000);
        
        const title = await browser.getTitle();
        console.log(`Search results title: ${title}`);
        
        expect(title).toContain('WebdriverIO');
    });

    it('should check search results', async () => {
        const results = await $$('.g');
        console.log(`Found ${results.length} search results`);
        
        expect(results.length).toBeGreaterThan(0);
    });

    after(async function() {
        console.log('Running teardown for example test suite');
    });
}); 