#! /usr/bin/env node
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import _ from 'lodash';
import meow from 'meow';
import execa from 'execa';
import chalk from 'chalk';

const cli = meow(
    `
	Usage
      $ blockr
      $ blockr unblock
      $ blockr unblock <site>

	Options
      --hosts-file,  -h   Path to the hosts file
      --config-file, -c   Path to the config file
      --password, -p      Sudo password
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
            password: {
                type: 'string',
                alias: 'p',
                default: null,
            },
        },
    },
);

const BEGIN_MARKER = '# BEGIN BLOCKR';
const END_MARKER = '# END BLOCKR';

const makeEntry = (host: string): string => `0.0.0.0 ${host}\n::      ${host}\n`;

function generateBlockString(hosts: string[]): string {
    let str = `${BEGIN_MARKER}\n`;

    hosts.forEach(
        (host: string): void => {
            str += makeEntry(host);
            str += makeEntry(`www.${host}`);
        },
    );

    str += END_MARKER;

    return str;
}

function tryWrite(hostsString: string): void {
    if (cli.flags.password) {
        fs.writeFileSync('/tmp/hosts', hostsString);
        execa.sync(`./runner.sh`, [cli.flags.password, cli.flags.hostsFile]);
    } else {
        try {
            fs.writeFileSync(cli.flags.hostsFile, hostsString);
        } catch (error) {
            if (error.code === 'EACCES') {
                console.log(
                    'Please re-run with sudo or use the `--password` option to write to the hosts file',
                );
            }
            process.exit(1);
        }
    }
}

function updateBlock(hostsMap: Record<string, string>): void {
    if (!fs.existsSync(cli.flags.hostsFile)) {
        fs.closeSync(fs.openSync(cli.flags.hostsFile, 'w'));
    }
    const currentHosts = fs.readFileSync(cli.flags.hostsFile, 'utf-8');
    const blockString = generateBlockString(_.values(hostsMap));

    const startLocation = currentHosts.indexOf(BEGIN_MARKER);
    const endLocation = currentHosts.indexOf(END_MARKER);

    let newHosts: string;
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

function loadConfig(): { hosts: Record<string, string> } {
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
    console.log('✅  All sites blocked');
}

if (command === 'unblock') {
    const site = cli.input[1];
    if (site) {
        if (config.hosts[site]) {
            updateBlock(_.omit(config.hosts, site));
            console.log(`✅  '${chalk.yellow(site)}' unblocked`);
        } else {
            console.error(`❌  No site called '${chalk.yellow(site)}'`);
        }
    } else {
        updateBlock({});
        console.log('✅  All sites unblocked');
    }
}
