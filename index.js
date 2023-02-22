const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const inputText = core.getInput('input-text');

try {
    const issue = findIssue(inputText);
    if (issue) {
        issueFound(issue);
    } else {
        console.log("Issue not found on provided input: " + inputText);
        //try to search in github object
        const commitMessages = github.context.payload.commits;
        if (commitMessages) {
            let res = commitMessages.some(function (element) {
                const issue = findIssue(element.message);
                if (issue) {
                    issueFound(issue);
                    return true;
                } else {
                    core.setOutput("issue", '');
                }
            });
        }
    }
} catch (error) {
    core.setFailed(error.message);
}

function findIssue(text) {
  return /APF-\d*/gim.exec(text)[0];
}

function issueFound(issue) {
    console.log("Issue found, Jira number: " + issue);
    core.setOutput("issue", issue);
    const filePath = require('os').homedir() + '/jira/';
    const fileName = 'config.yml';
    try {
        fs.mkdirSync(filePath, {recursive: true});
        fs.appendFileSync(filePath + fileName, 'issue: ' + issue + '\r\n')
    } catch (e) {
        core.setFailed('Error trying to create the file ' + fileName);
    }
}
