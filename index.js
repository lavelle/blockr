const fs = require('fs');
const path = require('path');
const meow = require('meow');

const cli = meow(
    `
	Usage
	  $ blocko

	Options
	  --hosts-file, -h  Path to the hosts file
`,
    {
        flags: {
            'hosts-file': {
                type: 'string',
                alias: 'h',
                default: '/etc/hosts',
            },
        },
    },
);

const BEGIN_MARKER = '# BEGIN BLOCKO';
const END_MARKER = '# END BLOCKO';

const makeEntry = host => `0.0.0.0 ${host}\n::      ${host}\n`;

function generateBlockString(hosts) {
    let str = `${BEGIN_MARKER}\n`;

    hosts.forEach(host => {
        str += makeEntry(host);
        str += makeEntry(`www.${host}`);
    });

    str += END_MARKER;

    return str;
}

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'blocko.json'), 'utf-8'));

// fs.closeSync(fs.openSync(cli.flags.hostsFile, 'w'));

const currentHosts = fs.readFileSync(cli.flags.hostsFile, 'utf-8');

const blockString = generateBlockString(config.hosts);

const startLocation = currentHosts.indexOf(BEGIN_MARKER);
const endLocation = currentHosts.indexOf(END_MARKER);

let newHosts;
if (startLocation > -1 && endLocation > -1) {
    newHosts =
        currentHosts.substr(0, startLocation) +
        blockString +
        currentHosts.substr(endLocation + END_MARKER.length);
} else {
    newHosts = `${currentHosts}\n${blockString}`;
}

fs.writeFileSync(cli.flags.hostsFile, newHosts);
