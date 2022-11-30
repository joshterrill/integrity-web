# Integrity - Web

An experimental, proof-of-concept application that provides an examnple of how web-app owners can keep malicious attackers from modifying client-side web code. If this code detects that any client-side code has been modified, it triggers an alert that is displayed to the user that can't be removed.

An example being call-center scam artists who trick people into logging into their bank account and modify the HTML code to make it seem like money was transferred to them that wasn't actually there.

If anyone finds any way around this, please open an issue, I'd love to see how you did it.

### Installation

```bash
git clone https://github.com/joshterrill/integrity-web
cd integrity-web/
npm i
npm run start
# or npm run dev
```

Then navigate to http://localhost:3000

### Usage

When navigating to http://localhost:3000 open the client-side inspector and change any bit of code.

<img src="preview.gif" />

