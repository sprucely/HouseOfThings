# House of Things

Just a simple inventory app to help bring some sanity to the Household of Things

## Table of Contents

- [House of Things](#house-of-things)
  - [Table of Contents](#table-of-contents)
  - [Security](#security)
  - [Background](#background)
  - [Try it Out](#try-it-out)
  - [Building and Running](#building-and-running)
  - [Maintainers](#maintainers)
  - [Contributing](#contributing)
  - [License](#license)

## Security

There is none. Do NOT expose this app to the internet. It's intended to be run on a home lan where all users are fully trusted.

Some things that I haven't gottne around to:
- Authentication
- Authorization
- Validation

## Background

Living in a household with other people involves more than just contending with different personalities. It involves the commingling
of your stuff. I created this app to help reduce the friction that can occur when things stored in common areas get moved around.
I did find some existing apps that pretty much do the same thing, however they stored your data with a third-party service. Sorry,
but no. I don't care to have my entire inventory of valuables published when a service is inevitably compromised.

## Try it Out

The app is intended to be served from a docker container, which is easily deployable to a networked device, such as a Raspberry Pi or a
Synology NAS. The following command will run the app directly from an image downloaded from [Docker Hub](https://hub.docker.com/).
Replace [DATA] with an absolute path to a local folder...

```
docker run --rm -it -p 8000:80 \
  -v [DATA]:/data \
  -e ConnectionStrings:DefaultConnection="Data Source=/data/HouseOfThings.sqlite3" \
  spruceness/house-of-things
```

After starting the app, open a browser tab and navigate to http://localhost:8000. You should be presented with the House of Things app
with the pane on the left filled with some default locations. The file `HouseOfThings.sqlite3` will be created in your local data
folder. Once you setup a production container, I recommend you establish some method of automatically backing up the sqlite db.

## Building and Running

I won't go into details of setting up a development environment, but below are some basic commands for getting up and running...

Build docker image
```
docker build -t hot_web_app .
```

Run container without ssl (device camera feature won't work) replacing [DATA] with an appropriate local absolute path. The file
`HouseOfThings.sqlite3` will be created in your local data folder.
```
docker run --rm -it -p 8000:80 \
  -v [DATA]:/data \
  -e ConnectionStrings:DefaultConnection="Data Source=/data/HouseOfThings.sqlite3" \
  hot_web_app
```

Setup a self-signed dev cert, replacing [CERT_PWD] with an appropriate password
```
dotnet dev-certs https -ep ${HOME}/.aspnet/https/aspnetapp.pfx -p [CERT_PWD]
```

Run container with ssl (necessary for using device camera from browser) replacing [DATA] with an appropriate local absolute path. The file `HouseOfThings.sqlite3` will be created in your local data folder.
```
docker run --rm -it -p 8000:80 -p 8001:443 \
  -v [DATA]:/data \
  -v ${HOME}/.aspnet/https:/https/ \
  -e ConnectionStrings:DefaultConnection="Data Source=/data/HouseOfThings.sqlite3" \
  -e ASPNETCORE_URLS="https://+;http://+" \
  -e ASPNETCORE_HTTPS_PORT=8001 \
  -e ASPNETCORE_Kestrel__Certificates__Default__Password="[CERT_PWD]" \
  -e ASPNETCORE_Kestrel__Certificates__Default__Path=/https/aspnetapp.pfx \
  hot_web_app
```

## Maintainers

[@sprucely](https://github.com/sprucely)

## Contributing

PRs accepted.

## License

MIT © 2021 Spruce Weber-Milne
