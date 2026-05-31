FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN mkdir -p /app/uploads
# The spring-boot-maven-plugin uses <classifier>exec</classifier>, so the runnable
# (repackaged) jar is the *-exec.jar — the plain *.jar has no Main-Class manifest.
COPY --from=build /app/target/*-exec.jar app.jar
EXPOSE 8080
# Render's free tier has no outbound IPv6. smtp.gmail.com (and other hosts) often
# resolve to IPv6 first, causing "Network unreachable" hangs. Force IPv4.
ENTRYPOINT ["java", "-Djava.net.preferIPv4Stack=true", "-jar", "app.jar"]
