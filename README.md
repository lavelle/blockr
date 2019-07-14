# Blockr

Block distracting sites from the command line

## Install

```
yarn global add blockr
```

## Usage

Start by creating the file `~/blockr.json`. You can use the file in this repo as a starting point. It should contain a single `hosts` key containing the URLs of sites you would like to block.

### Activate

Run `blockr` to block all of the sites in your config file.

### Deactivate

Run `blockr unblock` to remove the block.
Run `blockr unblock [sitename]` to unblock a particular site.

## Planned features

- Temporarily unblocking a site for 10 minutes or something

## License

MIT
