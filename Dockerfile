# https://hub.docker.com/_/microsoft-dotnet
FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
WORKDIR /source

# set up node
ENV NODE_VERSION 13.7.0
ENV NODE_DOWNLOAD_SHA 49ecb710e29c3ea0617803f450e2dc9b229688f1576190826ffdd5a9eaae7869
RUN curl -SL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz" --output nodejs.tar.gz \
&& echo "$NODE_DOWNLOAD_SHA nodejs.tar.gz" | sha256sum -c - \
&& tar -xzf "nodejs.tar.gz" -C /usr/local --strip-components=1 \
&& rm nodejs.tar.gz \
&& ln -s /usr/local/bin/node /usr/local/bin/nodejs

# copy csproj and restore as distinct layers
COPY *.sln .
COPY src/HoT.Core/*.csproj ./src/HoT.Core/
COPY src/HoT.Web/*.csproj ./src/HoT.Web/
COPY src/HoT.Test/*.csproj ./src/HoT.Test/
RUN dotnet restore

# copy everything else and build app
COPY src/HoT.Core/. ./src/HoT.Core/
COPY src/HoT.Web/. ./src/HoT.Web/
COPY src/HoT.Test/. ./src/HoT.Test/
WORKDIR /source/src/HoT.Web
RUN dotnet publish -c release -r linux-x64 -o /app

# final stage/image
FROM mcr.microsoft.com/dotnet/aspnet:5.0
WORKDIR /app
COPY --from=build /app ./
ENTRYPOINT ["dotnet", "HoT.Web.dll"]
