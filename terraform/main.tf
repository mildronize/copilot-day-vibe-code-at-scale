locals {
  location = "southeastasia"
  suffix   = "copilot-vibe"

  resource_group_name           = "rg-${local.suffix}"
  container_app_environment_name = "acae-${local.suffix}"
  container_app_name            = "aca-${local.suffix}"
  postgresql_server_name        = "psqlflex-${local.suffix}"
  postgresql_database_name      = "app-${local.suffix}"
  postgresql_admin_username     = "copilotadmin"
}

resource "azurerm_resource_group" "main" {
  name     = local.resource_group_name
  location = local.location
}

resource "azurerm_container_app_environment" "main" {
  name                = local.container_app_environment_name
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_container_app" "main" {
  name                         = local.container_app_name
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  template {
    container {
      name   = "app"
      image  = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
      cpu    = 0.25
      memory = "0.5Gi"
    }
    min_replicas = 1
    max_replicas = 1
  }

  ingress {
    external_enabled = true
    target_port      = 80
    transport        = "auto"
    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }
}

resource "azurerm_postgresql_flexible_server" "main" {
  name                          = local.postgresql_server_name
  resource_group_name           = azurerm_resource_group.main.name
  location                      = local.location
  version                       = "16"
  sku_name                      = "B_Standard_B1ms"
  administrator_login           = local.postgresql_admin_username
  administrator_password        = var.db_admin_password
  storage_mb                    = 32768
  backup_retention_days         = 7
  public_network_access_enabled = true
}

resource "azurerm_postgresql_flexible_server_database" "app" {
  name      = local.postgresql_database_name
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}
