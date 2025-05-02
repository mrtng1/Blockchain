# Base image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY ["Blockchain.WebApi/Blockchain.WebApi.csproj", "Blockchain.WebApi/"]
COPY ["Blockchain.Core/Blockchain.Core.csproj", "Blockchain.Core/"]

# Restore all projects
RUN dotnet restore "Blockchain.WebApi/Blockchain.WebApi.csproj"

# Copy the rest of the solution
COPY . .

# Build the app
WORKDIR "/src/Blockchain.WebApi"
RUN dotnet build "Blockchain.WebApi.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "Blockchain.WebApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Blockchain.WebApi.dll"]
