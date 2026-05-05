# 📘 MANUAL DE INSTALACIÓN - PROYECTO 19
## Sistema de Reportes de Ocupación de Hospedaje

---

## 📋 TABLA DE CONTENIDOS

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación de Node.js](#instalación-de-nodejs)
3. [Configuración de SQL Server](#configuración-de-sql-server)
4. [Instalación del Proyecto Web](#instalación-del-proyecto-web)
5. [Despliegue en IIS (Producción)](#despliegue-en-iis-producción)
6. [Verificación y Pruebas](#verificación-y-pruebas)
7. [Solución de Problemas](#solución-de-problemas)

---

## 📌 REQUISITOS PREVIOS

### Software Necesario:

- ✅ Windows 10/11 o Windows Server 2016+
- ✅ SQL Server 2016+ (cualquier edición)
- ✅ Node.js v14.0.0 o superior
- ✅ IIS 10.0+ (para producción)

### Puertos Utilizados:

- **3000**: Servidor de desarrollo (Node.js)
- **8080**: Servidor de producción (IIS) - configurable

---

## 🔧 INSTALACIÓN DE NODE.JS

### Paso 1: Descargar Node.js

1. Ve a: https://nodejs.org/
2. Descarga la versión **LTS** (Long Term Support)
3. Ejecuta el instalador descargado

### Paso 2: Instalar

1. Click **Next** en todas las ventanas
2. Acepta los términos de licencia
3. Click **Install**
4. Espera a que termine
5. Click **Finish**

### Paso 3: Verificar Instalación

Abre **CMD** y ejecuta:

```bash
node --version
```

**Resultado esperado:**
```
v22.14.0 (o superior)
```

---

## 🗄️ CONFIGURACIÓN DE SQL SERVER

### Paso 1: Habilitar Autenticación Mixta

1. Abre **SQL Server Management Studio (SSMS)**
2. Conéctate al servidor
3. **Click derecho** en el servidor → **Propiedades**
4. Ve a **Seguridad** (Security)
5. Selecciona: **"Modo de autenticación de SQL Server y Windows"**
6. Click **OK**

### Paso 2: Reiniciar SQL Server

**Opción A: Desde SSMS**
1. Click derecho en el servidor
2. Click **Reiniciar** (Restart)

**Opción B: Desde Servicios**
1. Windows + R → `services.msc`
2. Busca **SQL Server (MSSQLSERVER)**
3. Click derecho → **Reiniciar**

### Paso 3: Crear Usuario de SQL Server

Ejecuta este script en **SSMS**:

```sql
-- Crear login a nivel de servidor
USE master;
GO

CREATE LOGIN proyecto19 WITH PASSWORD = 'Proyecto123';
GO

-- Crear usuario en la base de datos
USE hospestar;
GO

CREATE USER proyecto19 FOR LOGIN proyecto19;
GO

-- Dar permisos de lectura y escritura
EXEC sp_addrolemember 'db_datareader', 'proyecto19';
EXEC sp_addrolemember 'db_datawriter', 'proyecto19';
GO

-- Verificar creación
SELECT name FROM sys.sql_logins WHERE name = 'proyecto19';
GO
```

**Resultado esperado:**
```
name
-----------
proyecto19
```

### Paso 4: Verificar Base de Datos

La base de datos **hospestar** debe tener:
- ✅ Tabla: **HistoryOcu**
- ✅ Registros: 3,219 (aproximadamente)
- ✅ Campos: 49 columnas

**Verificación:**
```sql
USE hospestar;
GO

SELECT COUNT(*) as TotalRegistros FROM HistoryOcu;
GO
```

---

## 💻 INSTALACIÓN DEL PROYECTO WEB

### Paso 1: Ubicar Archivos del Proyecto

Coloca todos los archivos en una carpeta, por ejemplo:

```
C:\Users\CARLOS DANIEL\Desktop\proyecto 19\
```

### Paso 2: Estructura de Archivos

Verifica que tengas estos archivos:

```
proyecto 19\
├── index.html          (Página principal)
├── style.css           (Estilos)
├── app.js              (JavaScript frontend)
├── server.js           (Servidor Node.js)
├── package.json        (Dependencias)
├── web.config          (Configuración IIS - crear después)
└── README.md           (Este archivo)
```

### Paso 3: Instalar Dependencias

Abre **CMD** en la carpeta del proyecto:

```bash
cd "C:\Users\CARLOS DANIEL\Desktop\proyecto 19"
```

Instala las dependencias:

```bash
npm install
```

**Resultado esperado:**
```
added 57 packages, and audited 58 packages in 5s
```

### Paso 4: Configurar Conexión a SQL Server

Abre el archivo **server.js** con un editor de texto y verifica las líneas 18-26:

```javascript
const dbConfig = {
    user: 'proyecto19',           // ← Usuario creado en SQL Server
    password: 'Proyecto123',      // ← Contraseña del usuario
    server: 'localhost',          // ← Servidor SQL (cambiar si es remoto)
    database: 'hospestar',        // ← Nombre de la base de datos
    options: {
        encrypt: false,
        enableArithAbort: true
    }
};
```

**IMPORTANTE:** 
- Si SQL Server está en otra computadora, cambia `localhost` por la IP del servidor
- Si usas otro usuario/contraseña, actualiza estos valores

### Paso 5: Probar en Modo Desarrollo

Ejecuta el servidor:

```bash
npm start
```

**Resultado esperado:**
```
✅ Conectado a SQL Server

╔════════════════════════════════════════╗
║   🚀 Proyecto 19 - Servidor Activo    ║
╠════════════════════════════════════════╣
║   📍 URL: http://localhost:3000       ║
║   📊 Base de Datos: hospestar          ║
║   ✅ Estado: Funcionando               ║
╚════════════════════════════════════════╝

📌 Abre tu navegador en: http://localhost:3000
```

### Paso 6: Verificar Funcionamiento

Abre el navegador y ve a:
```
http://localhost:3000
```

Debes ver:
- ✅ Menú lateral con 4 reportes
- ✅ Selectores de fecha
- ✅ Botón "Ver Reporte"

Prueba un reporte:
1. Click en **"Reporte 1"**
2. Selecciona fecha: **01/04/2026**
3. Click **"Ver Reporte"**
4. Debe mostrar una tabla con datos

**Si funciona correctamente, continúa con el despliegue en IIS.**

---

## 🌐 DESPLIEGUE EN IIS (PRODUCCIÓN)

### Requisitos Previos para IIS

Antes de comenzar, necesitas tener instalado:

1. ✅ **IIS** (Internet Information Services)
2. ✅ **iisnode** - Módulo para ejecutar Node.js en IIS
3. ✅ **URL Rewrite** - Módulo para reescritura de URLs

---

### A. Verificar IIS

**Verificación:**
1. Windows + R → `inetmgr` → Enter
2. Si se abre IIS Manager → Ya lo tienes ✅

**Si NO tienes IIS:**
1. Panel de Control → Programas → Activar características de Windows
2. Marca: **Internet Information Services**
3. Expande IIS → Marca:
   - World Wide Web Services
   - Application Development Features
   - ASP.NET 4.8
4. Click **OK**
5. Espera a que instale (5-10 minutos)

---

### B. Instalar iisnode

**Paso 1: Descargar**
1. Ve a: https://github.com/Azure/iisnode/releases/latest
2. Descarga: **iisnode-full-v0.2.26-x64.msi**

**Paso 2: Instalar**
1. Ejecuta el archivo .msi
2. Click **Next** → **Install** → **Finish**

**Paso 3: Reiniciar IIS**

Abre **CMD como Administrador** y ejecuta:
```bash
iisreset
```

**Paso 4: Confirmar Instalación**

Verifica que existe la carpeta:
```
C:\Program Files\iisnode\
```

Debe contener el archivo: **iisnode.dll**

---

### C. Instalar URL Rewrite

**Paso 1: Descargar**

Ve a: https://www.iis.net/downloads/microsoft/url-rewrite

O descarga directamente:
```
https://download.microsoft.com/download/1/2/8/128E2E22-C1B9-44A4-BE2A-5859ED1D4592/rewrite_amd64_en-US.msi
```

**Paso 2: Instalar**
1. Ejecuta el instalador **rewrite_amd64_en-US.msi**
2. Click **I accept** → **Install**
3. Click **Finish**

**Paso 3: Reiniciar IIS**

Abre **CMD como Administrador**:
```bash
iisreset
```

**Paso 4: Verificar**
1. Abre IIS Manager
2. Click en el servidor (LAPTOP-186IB22A)
3. En el panel central debe aparecer el ícono: **"Reescritura de direcciones URL"** o **"URL Rewrite"**

---

### D. Crear Archivo web.config

**Paso 1: Ubicación**

En la carpeta del proyecto:
```
C:\Users\CARLOS DANIEL\Desktop\proyecto 19\
```

**Paso 2: Crear archivo**

1. Click derecho → Nuevo → Documento de texto
2. Nombre: `web.config` (sin .txt)
3. Abrir con Bloc de notas
4. Pegar este contenido:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    
    <!-- Handler para iisnode -->
    <handlers>
      <add name="iisnode" path="server.js" verb="*" modules="iisnode" />
    </handlers>
    
    <!-- Reglas de URL Rewrite -->
    <rewrite>
      <rules>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="server.js"/>
        </rule>
      </rules>
    </rewrite>
    
    <!-- Pasar errores HTTP tal cual -->
    <httpErrors existingResponse="PassThrough" />
    
    <!-- Configuración de iisnode -->
    <iisnode 
      nodeProcessCommandLine="C:\Program Files\nodejs\node.exe"
      loggingEnabled="true" 
      devErrorsEnabled="false"
      node_env="production" />
      
  </system.webServer>
</configuration>
```

5. **Guardar** (Ctrl+S)

---

### E. Crear Sitio en IIS

**Paso 1: Abrir IIS Manager**

Windows + R → `inetmgr` → Enter

**Paso 2: Agregar Sitio**

1. En el panel izquierdo, **click derecho** en **"Sites"**
2. Click **"Add Website..."** o **"Agregar sitio web..."**

**Paso 3: Configurar Sitio**

Llena el formulario:

```
Site name (Nombre del sitio): Proyecto19

Application pool (Grupo de aplicaciones): Proyecto19 (se crea automáticamente)

Physical path (Ruta de acceso física): 
  C:\Users\CARLOS DANIEL\Desktop\proyecto 19

Binding (Enlace):
  Type (Tipo): http
  IP address (Dirección IP): All Unassigned (Todas sin asignar)
  Port (Puerto): 8080
  Host name (Nombre de host): (dejar vacío)

☑ Start Website immediately (Iniciar sitio web inmediatamente)
```

4. Click **OK** o **Aceptar**

**Paso 4: Configurar Application Pool**

1. En el panel izquierdo, click **"Application Pools"** o **"Grupos de aplicaciones"**
2. Busca **Proyecto19**
3. **Click derecho** → **Advanced Settings** o **Configuración avanzada**
4. Cambia:
   ```
   .NET CLR Version: No Managed Code (Sin código administrado)
   ```
5. Click **OK**

**Paso 5: Configurar Permisos**

1. En Sites, **click derecho** en **Proyecto19**
2. Click **"Edit Permissions..."** o **"Editar permisos"**
3. Pestaña **Security** o **Seguridad** → **Edit** o **Editar**
4. Click **Add** o **Agregar**
5. Escribe: `IIS_IUSRS`
6. Click **Check Names** → **OK**
7. Selecciona **IIS_IUSRS**
8. Marca:
   - ☑ Read & execute (Lectura y ejecución)
   - ☑ List folder contents (Mostrar el contenido de la carpeta)
   - ☑ Read (Lectura)
9. Click **Apply** → **OK**

**Paso 6: Reiniciar IIS**

Abre CMD como Administrador:

```bash
iisreset
```

**Paso 7: Iniciar Sitio**

1. En IIS Manager, Sites → Proyecto19
2. Panel derecho → Click **Start** o **Iniciar**
3. Estado debe ser: **Started** (Iniciado)

---

## ✅ VERIFICACIÓN Y PRUEBAS

### Prueba 1: Acceso Local

Abre el navegador:
```
http://localhost:8080
```

**Debe mostrar:**
- ✅ Página web con menú de 4 reportes
- ✅ Diseño correcto
- ✅ Sin errores

### Prueba 2: API Funcionando

Ve a:
```
http://localhost:8080/api/health
```

**Debe mostrar:**
```json
{
  "status": "OK",
  "timestamp": "2026-05-02...",
  "database": "hospestar",
  "message": "Servidor funcionando correctamente"
}
```

### Prueba 3: Reportes con Datos

1. Ve a: `http://localhost:8080`
2. Click **"Reporte 1"**
3. Fecha: **01/04/2026**
4. Click **"Ver Reporte"**

**Debe mostrar:**
- ✅ Tabla con datos reales
- ✅ Columnas: Banda, MASCULINO, FEMENINO, Total
- ✅ Sin errores

### Prueba 4: Acceso desde Red Local (Opcional)

**Paso 1: Obtener tu IP**

CMD:
```bash
ipconfig
```

Busca: **IPv4 Address** (ejemplo: 192.168.1.100)

**Paso 2: Agregar Binding**

1. IIS Manager → Proyecto19 → Bindings
2. Add → http + tu IP + puerto 8080
3. OK

**Paso 3: Firewall**

1. Windows Firewall con seguridad avanzada
2. Inbound Rules → New Rule
3. Port → 8080 → Allow
4. Finish

**Paso 4: Probar desde otra PC**

```
http://192.168.1.100:8080
```

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Error: "Cannot connect to SQL Server"

**Síntomas:**
- Servidor no inicia
- Error de conexión en CMD

**Soluciones:**

1. **Verificar SQL Server está corriendo**
   - Services → SQL Server (MSSQLSERVER) → Running

2. **Verificar credenciales en server.js**
   ```javascript
   user: 'proyecto19',
   password: 'Proyecto123',
   ```

3. **Verificar autenticación mixta habilitada**
   - SSMS → Propiedades → Seguridad

4. **Recrear usuario**
   ```sql
   USE master;
   DROP LOGIN proyecto19;
   GO
   -- Luego ejecutar script de creación de nuevo
   ```

---

### Error: "Port 3000 already in use"

**Síntomas:**
- npm start falla
- Error: EADDRINUSE

**Soluciones:**

1. **Matar procesos de Node.js**
   ```bash
   taskkill /F /IM node.exe
   ```

2. **Verificar puerto libre**
   ```bash
   netstat -ano | findstr :3000
   ```

3. **Matar proceso específico**
   ```bash
   taskkill /F /PID ####
   ```

---

### Error: "HTTP 500.0 - Internal Server Error" (IIS)

**Síntomas:**
- IIS muestra error 500
- Página no carga

**Soluciones:**

1. **Verificar web.config existe**
   - Debe estar en la carpeta raíz del proyecto

2. **Verificar iisnode instalado**
   - `C:\Program Files\iisnode\` debe existir

3. **Revisar logs**
   ```
   C:\Users\CARLOS DANIEL\Desktop\proyecto 19\iisnode\
   ```

4. **Reiniciar IIS**
   ```bash
   iisreset
   ```

---

### Error: Reportes no cargan datos

**Síntomas:**
- Página carga
- Reportes muestran "Error al cargar"

**Soluciones:**

1. **Verificar API directamente**
   ```
   http://localhost:8080/api/health
   ```

2. **Revisar consola del navegador**
   - F12 → Console → Ver errores

3. **Verificar datos en SQL**
   ```sql
   SELECT COUNT(*) FROM HistoryOcu;
   ```

4. **Limpiar caché del navegador**
   - Ctrl+Shift+Delete → Borrar todo

---

## 📊 INFORMACIÓN DEL SISTEMA

### Credenciales SQL Server

```
Usuario: proyecto19
Contraseña: Proyecto123
Base de datos: hospestar
Tabla principal: HistoryOcu
```

### URLs de Acceso

```
Desarrollo: http://localhost:3000
Producción (IIS): http://localhost:8080
API Health: http://localhost:8080/api/health
```

### Archivos Importantes

```
server.js      - Configuración del servidor Node.js
web.config     - Configuración de IIS
package.json   - Dependencias del proyecto
index.html     - Página principal
app.js         - Lógica del frontend
```

### Estructura de la Base de Datos

```
Base de datos: hospestar
Tabla: HistoryOcu
Registros: 3,219
Campos principales:
  - FechaPer (datetime)
  - Tipo (varchar)
  - dni (varchar)
  - Huesped (varchar)
  - nombreempr (varchar)
  - GeneroH (varchar)
  - Banda (varchar)
  - Area (varchar)
  - Codigo (varchar)
```

---

## 📞 SOPORTE

Para problemas adicionales, revisar:
- Logs de IIS: `C:\inetpub\logs\LogFiles\`
- Logs de iisnode: `[proyecto]\iisnode\`
- Consola del navegador: F12 → Console

---

## ✅ CHECKLIST DE INSTALACIÓN

```
□ Node.js v22.14.0+ instalado
□ SQL Server configurado con autenticación mixta
□ Usuario proyecto19 / Proyecto123 creado en SQL
□ Base de datos hospestar con 3,219 registros
□ Archivos del proyecto descargados
□ npm install ejecutado correctamente
□ npm start funciona en desarrollo
□ IIS instalado
□ iisnode instalado y verificado
□ URL Rewrite instalado y verificado
□ web.config creado en carpeta del proyecto
□ Sitio Proyecto19 creado en IIS
□ Application Pool configurado (No Managed Code)
□ Permisos IIS_IUSRS configurados
□ IIS reiniciado con iisreset
□ http://localhost:8080 funciona
□ http://localhost:8080/api/health responde JSON
□ Los 4 reportes cargan datos correctamente
```

---

## 📝 NOTAS FINALES

- **Seguridad:** Para producción, cambiar la contraseña del usuario SQL por una más segura
- **Backups:** Configurar backups automáticos de la base de datos hospestar
- **Monitoreo:** Revisar logs periódicamente en `[proyecto]\iisnode\`
- **Actualizaciones:** Mantener Node.js actualizado con las versiones LTS

---

**Proyecto 19 - Sistema de Reportes de Ocupación**  
Versión 1.0.0  
Mayo 2026
