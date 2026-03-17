const { User, Tenant, UserTenant } = require('../config/database'); // Importa tus modelos

const authorizeTenant = async (req, res, next) => {
    try {
        // El tenantId debería venir en los headers (ej: x-tenant-id) 
        // o como parámetro en la URL
        const tenantId = req.headers['x-tenant-id'] || req.params.tenantId;
        const userId = req.user.id; // Obtenido del JWT previo (verifyToken)

        if (!tenantId) {
            return res.status(400).json({ message: "Tenant ID is required" });
        }

        // Buscamos la relación en la tabla intermedia
        const permission = await UserTenant.findOne({
            where: {
                userId: userId,
                tenantId: tenantId
            }
        });

        if (!permission) {
            return res.status(403).json({ 
                message: "Access denied: You don't belong to this tenant." 
            });
        }

        // Opcional: Inyectamos el rol actual en la petición por si lo necesitas
        req.userRole = permission.role;
        req.currentTenantId = tenantId;

        next();
    } catch (error) {
        res.status(500).json({ message: "Internal server error during authorization" });
    }
};

module.exports = authorizeTenant;