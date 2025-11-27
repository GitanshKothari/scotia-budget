# Multi-stage build for Spring Boot application

# Stage 1: Build stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml and download dependencies (this layer will be cached if pom.xml doesn't change)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Install curl for health checks (Alpine doesn't have wget by default)
RUN apk add --no-cache curl

# Create a non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring

# Copy the JAR file from build stage (as root)
COPY --from=build /app/target/core-1.0.0.jar app.jar

# Change ownership to spring user
RUN chown spring:spring app.jar

# Switch to non-root user
USER spring:spring

# Expose port 8080
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]

