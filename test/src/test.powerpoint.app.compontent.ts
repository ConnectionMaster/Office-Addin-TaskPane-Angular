import { Component } from '@angular/core';
import { pingTestServer, sendTestResults } from "office-addin-test-helpers";
import * as testHelpers from "./test-helpers";
import * as powerpoint from "../../src/taskpane/app/powerpoint.app.component";
const template = require('./../../src/taskpane/app/app.component.html');
const port: number = 4201;
let testValues: any = [];

@Component({
    selector: 'app-home',
    template
})
export default class AppComponent {
    welcomeMessage = 'Welcome';
    constructor() {
        Office.onReady(async () => {
            const testServerResponse: object = await pingTestServer(port);
            if (testServerResponse["status"] == 200) {
                this.runTest();
            }
        });

    }

    async runTest(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                // Execute taskpane code
                const powerpointComponent = new powerpoint.default();
                await powerpointComponent.run();
                await testHelpers.sleep(2000);

                // Get output of executed taskpane code
                PowerPoint.run(async (context) => {
                    // get selected text
                    const selectedText = await this.getSelectedText();
                    // send test results
                    testHelpers.addTestResult(testValues, "output-message", selectedText, " Hello World!");
                    await sendTestResults(testValues, port);
                    testValues.pop();
                    resolve();
                });
            } catch {
                reject();
            }
        });
    }

    async getSelectedText(): Promise<string> {
        return new Promise((resolve, reject) => {
            Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, (result: Office.AsyncResult<string>) => {
                if (result.status === Office.AsyncResultStatus.Failed) {
                    reject(result.error);
                } else {
                    resolve(result.value);
                }
            });
        })    
    }
}