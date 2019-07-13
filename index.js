#! /usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const _ = require('lodash');
const meow = require('meow');

const cli = meow(
    `
	Usage
      $ blockr
      $ blockr unblock
      $ blockr unblock <site>

	Options
      --hosts-file,  -h   Path to the hosts file
      --config-file, -c   Path to the config file
`,
    {
        flags: {
            'hosts-file': {
                type: 'string',
                alias: 'h',
                default: '/etc/hosts',
            },
            'config-file': {
                type: 'string',
                alias: 'c',
                default: path.join(os.homedir(), 'blockr.json'),
            },
        },
    },
);

const BEGIN_MARKER = '# BEGIN BLOCKR';
const END_MARKER = '# END BLOCKR';

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

function tryWrite(hosts) {
    try {
        fs.writeFileSync(cli.flags.hostsFile, hosts);
    } catch (error) {
        if (error.code === 'EACCES') {
            console.log('Please re-run with sudo to write to the hosts file');
        }
        process.exit(1);
    }
}

function updateBlock(hosts) {
    if (!fs.existsSync(cli.flags.hostsFile)) {
        fs.closeSync(fs.openSync(cli.flags.hostsFile, 'w'));
    }
    const currentHosts = fs.readFileSync(cli.flags.hostsFile, 'utf-8');
    const blockString = generateBlockString(_.values(hosts));

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

    tryWrite(newHosts);
}

function loadConfig() {
    try {
        return JSON.parse(fs.readFileSync(cli.flags.configFile, 'utf-8'));
    } catch (error) {
        console.error(`No config file found at ${cli.flags.configFile}`);
        process.exit(1);
    }

    return null;
}

const command = cli.input[0];

const config = loadConfig();

if (!command || command === 'block') {
    updateBlock(config.hosts);
}

if (command === 'unblock') {
    if (cli.input[1]) {
        updateBlock(_.omit(config.hosts, cli.input[1]));
    } else {
        updateBlock({});
    }
}
