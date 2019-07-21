# Blockr

> Block distracting sites from the command line

## Features

I built this as a replacement for [SelfControl](https://github.com/SelfControlApp/). It has the following features:

-   Cross platform (MacOS and Linux).
-   Configurable with a human-readable and editable JSON file instead of plists.
-   Easily unblock a single site (sometimes a site like Reddit, Twitter or Medium **does** have a useful article you want to read at work, but you don't want to unblock everything).
-   Command line interface instead of GUI.
-   Runs indefinitely until you turn it off, rather than having to re-run it every 24 hours.
-   Offers an easier way to authenticate as root, which is needed for editing the hosts file.

## Install

```
yarn global add blockr
```

## Usage

Start by creating the file `~/blockr.json`. You can use the file in this repo as a starting point. It should contain a single `hosts` key containing the URLs of sites you would like to block. This file can use JSON5 syntax, including comments and trailing commas.

### Activate

Run `blockr` to block all of the sites in your config file.

### Deactivate

Run `blockr unblock` to remove the block.
Run `blockr unblock [sitename]` to unblock a particular site.

### Authenticating

Blockr works by editing the hosts file at `/etc/hosts`. This requires root access. You can acheive this by running `sudo blockr`, however this will require you to type your password every time you use it.

You can also provide your sudo password via a flag, like `blockr --password hunter2`. If you're worried about security, use a command line password manager like 1Password to echo the password. Using a literal is not recommended as your password will then be saved your shell history.

### Syncing config file

You can easily sync your config file in two ways: via a symlink, or a flag. First create your `blockr.json` somewhere else like `~/code/dotfiles/blockr.json`. Then you can point to it

Via a symlink: run `ln -s $HOME/code/dotfiles/blockr.json $HOME/blockr.json`

Via a flag: use `blockr --config-file $HOME/code/dotfiles/blockr.json`. You could also put this in an alias so you don't have to type it every time.

## Planned features

-   Temporarily unblocking a site for 10 minutes or something.
-   Require a one minute delay and a re-confirmation before unblocking.
-   Configure schedules when the block should be applied.
-   Show stats on how many times you've unblocked each site.
-   Run a background process to put back the block if the user tries to delete it by editing `/etc/hosts` directly, like SelfControl does.
-   Strict mode that prevents you from running `blockr unblock` for a certain period of time.
-   Groups of sites to block eg "social" or "news"
-   Support multiple URLs for one site, eg. bbc.co.uk and bbc.com

## License

MIT
