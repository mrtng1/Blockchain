FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Blockchain.WebApi/Blockchain.WebApi.csproj", "Blockchain.WebApi/"]
RUN dotnet restore "Blockchain.WebApi/Blockchain.WebApi.csproj"
COPY . .
WORKDIR "/src/Blockchain.WebApi"
RUN dotnet build "Blockchain.WebApi.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Blockchain.WebApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Blockchain.WebApi.dll"]
