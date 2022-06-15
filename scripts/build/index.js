#!/usr/bin/env zx

import { $ } from "zx";
import now from "performance-now";
import chalk from 'chalk';
import * as fs from "fs";

const REMOTE_ADDRESS = 'joseph@revers3ntropy.com';
const REMOTE_PATH = '/public_html/ess/circuits';
const LOCAL_PATH = './public/';

async function uploadFrontend () {
	const paths = fs.readdirSync(LOCAL_PATH);

	for (const path of paths) {
		if (fs.statSync(LOCAL_PATH + path).isDirectory()) {
			await $`sshpass -f './sshPass.txt' scp -r ${LOCAL_PATH}${path} ${REMOTE_ADDRESS}:~${REMOTE_PATH}`;
			continue;
		}
		await $`sshpass -f './sshPass.txt' scp ${LOCAL_PATH}${path} ${REMOTE_ADDRESS}:~${REMOTE_PATH}`;

	}
}

async function main () {
	const start = now();

	await $`rollup -c`;
	await $`npm run play`;

	await uploadFrontend();

	console.log(chalk.green(`Finished Uploading in ${(now() - start).toFixed(3)}`));
}

main();