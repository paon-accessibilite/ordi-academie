FROM ubuntu:24.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends xfce4 xvfb xauth dbus-x11 python3 ca-certificates pulseaudio xdotool x11-utils && rm -rf /var/lib/apt/lists/*
COPY release/Ordi-Academie-*-linux-amd64.deb /tmp/app.deb
COPY scripts/test-linux.sh /test-linux.sh
COPY scripts/run-linux-smoke.sh /run-linux-smoke.sh
# dpkg installe sans apt : aucune dépendance du paquet ne peut être téléchargée.
RUN dpkg -i /tmp/app.deb && rm /tmp/app.deb && chmod +x /test-linux.sh && mkdir /result
# Exécuter les missions avec un utilisateur non privilégié.
RUN useradd -m -u 1001 eleve && mkdir -p /tmp/ordi-qa && chown eleve /tmp/ordi-qa
CMD ["bash", "/test-linux.sh"]
