#!/usr/bin/env bash

set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this script as root."
  exit 1
fi

DEPLOY_USER="${1:-deploy}"
SSH_SOURCE_HOME="${2:-/root}"
DEPLOY_HOME="/home/${DEPLOY_USER}"

if id "${DEPLOY_USER}" >/dev/null 2>&1; then
  echo "User '${DEPLOY_USER}' already exists."
else
  echo "Creating user '${DEPLOY_USER}'"
  adduser --disabled-password --gecos "" "${DEPLOY_USER}"
fi

echo "Adding '${DEPLOY_USER}' to sudo group"
usermod -aG sudo "${DEPLOY_USER}"

if [[ -f "${SSH_SOURCE_HOME}/.ssh/authorized_keys" ]]; then
  echo "Copying authorized_keys from ${SSH_SOURCE_HOME}"
  mkdir -p "${DEPLOY_HOME}/.ssh"
  cp "${SSH_SOURCE_HOME}/.ssh/authorized_keys" "${DEPLOY_HOME}/.ssh/authorized_keys"
  chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${DEPLOY_HOME}/.ssh"
  chmod 700 "${DEPLOY_HOME}/.ssh"
  chmod 600 "${DEPLOY_HOME}/.ssh/authorized_keys"
else
  echo "No authorized_keys found in ${SSH_SOURCE_HOME}/.ssh/authorized_keys"
  echo "Create SSH access for '${DEPLOY_USER}' manually before disabling root login."
fi

echo "User '${DEPLOY_USER}' is ready."
