#[allow(duplicate_alias, unused_const, unused_variable)]
module suipass::access_control {
    use sui::object;
    use sui::tx_context;
    use sui::event;
    use sui::clock::{Self, Clock};
    use std::string::String;

    /// 权限级别定义
    const PERMISSION_VIEW: u64 = 1;      // 查看权限
    const PERMISSION_EDIT: u64 = 2;      // 编辑权限
    const PERMISSION_SHARE: u64 = 4;     // 分享权限
    const PERMISSION_ADMIN: u64 = 8;     // 管理员权限

    /// 访问能力对象
    public struct AccessCapability has key {
        id: UID,
        vault_id: ID,
        granted_to: address,
        granted_by: address,
        permission_level: u64,
        expires_at: u64,
        usage_count: u64,
        max_usage: u64,
        conditions: vector<String>,
        created_at: u64,
    }

    /// 权限授予事件
    public struct PermissionGranted has copy, drop {
        vault_id: ID,
        granted_to: address,
        granted_by: address,
        permission_level: u64,
        expires_at: u64,
        timestamp: u64,
    }

    /// 权限撤销事件
    public struct PermissionRevoked has copy, drop {
        vault_id: ID,
        revoked_from: address,
        revoked_by: address,
        timestamp: u64,
    }

    /// 权限使用事件
    public struct PermissionUsed has copy, drop {
        vault_id: ID,
        used_by: address,
        permission_level: u64,
        timestamp: u64,
    }

    /// 创建访问能力
    public fun create_access_capability(
        vault_id: ID,
        granted_to: address,
        permission_level: u64,
        expires_at: u64,
        max_usage: u64,
        conditions: vector<String>,
        clock: &Clock,
        ctx: &mut TxContext
    ): AccessCapability {
        let timestamp = clock::timestamp_ms(clock) / 1000;
        
        let capability = AccessCapability {
            id: object::new(ctx),
            vault_id,
            granted_to,
            granted_by: tx_context::sender(ctx),
            permission_level,
            expires_at,
            usage_count: 0,
            max_usage,
            conditions,
            created_at: timestamp,
        };
        
        // 发送授权事件
        event::emit(PermissionGranted {
            vault_id,
            granted_to,
            granted_by: tx_context::sender(ctx),
            permission_level,
            expires_at,
            timestamp,
        });
        
        capability
    }

    /// 使用访问能力
    public fun use_capability(
        capability: &mut AccessCapability,
        required_permission: u64,
        user: address,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms(clock) / 1000;
        
        // 验证权限
        assert!(capability.granted_to == user, 0);
        assert!(capability.permission_level & required_permission == required_permission, 1);
        assert!(current_time <= capability.expires_at, 2);
        assert!(capability.usage_count < capability.max_usage, 3);
        
        // 增加使用计数
        capability.usage_count = capability.usage_count + 1;
        
        // 发送使用事件
        event::emit(PermissionUsed {
            vault_id: capability.vault_id,
            used_by: user,
            permission_level: required_permission,
            timestamp: current_time,
        });
    }

    /// 撤销访问能力
    public fun revoke_capability(
        capability: AccessCapability,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender_address = tx_context::sender(ctx);
        let AccessCapability { 
            id, 
            vault_id, 
            granted_to, 
            granted_by, 
            permission_level: _, 
            expires_at: _, 
            usage_count: _, 
            max_usage: _, 
            conditions: _, 
            created_at: _ 
        } = capability;
        
        // 只有授权者或管理员可以撤销
        assert!(granted_by == tx_context::sender(ctx), 0);
        
        // 发送撤销事件
        event::emit(PermissionRevoked {
            vault_id,
            revoked_from: granted_to,
            revoked_by: sender_address,
            timestamp: clock::timestamp_ms(clock) / 1000,
        });
        
        object::delete(id);
    }

    /// 验证权限
    public fun has_permission(
        capability: &AccessCapability,
        user: address,
        required_permission: u64,
        clock: &Clock
    ): bool {
        let current_time = clock::timestamp_ms(clock) / 1000;
        
        capability.granted_to == user &&
        (capability.permission_level & required_permission) == required_permission &&
        current_time <= capability.expires_at &&
        capability.usage_count < capability.max_usage
    }

    /// 获取权限信息
    public fun capability_info(capability: &AccessCapability): (address, u64, u64, u64) {
        (capability.granted_to, capability.permission_level, capability.usage_count, capability.max_usage)
    }

    /// 更新权限级别
    public fun update_permission_level(
        capability: &mut AccessCapability,
        new_permission_level: u64,
        ctx: &mut TxContext
    ) {
        assert!(capability.granted_by == tx_context::sender(ctx), 0);
        capability.permission_level = new_permission_level;
    }

    /// 延长有效期
    public fun extend_expiry(
        capability: &mut AccessCapability,
        new_expires_at: u64,
        _clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(capability.granted_by == tx_context::sender(ctx), 0);
        assert!(new_expires_at > capability.expires_at, 1);
        capability.expires_at = new_expires_at;
    }

    /// 增加最大使用次数
    public fun increase_max_usage(
        capability: &mut AccessCapability,
        additional_usage: u64,
        ctx: &mut TxContext
    ) {
        assert!(capability.granted_by == tx_context::sender(ctx), 0);
        capability.max_usage = capability.max_usage + additional_usage;
    }

    /// 检查是否过期
    public fun is_expired(capability: &AccessCapability, clock: &Clock): bool {
        clock::timestamp_ms(clock) / 1000 > capability.expires_at
    }

    /// 检查是否已达使用上限
    public fun is_usage_exhausted(capability: &AccessCapability): bool {
        capability.usage_count >= capability.max_usage
    }

    /// 获取剩余使用次数
    public fun remaining_usage(capability: &AccessCapability): u64 {
        if (capability.usage_count >= capability.max_usage) {
            0
        } else {
            capability.max_usage - capability.usage_count
        }
    }

    /// 权限组合检查 - 是否包含所有指定权限
    public fun has_all_permissions(
        capability: &AccessCapability,
        permissions: vector<u64>
    ): bool {
        let mut i = 0;
        let len = vector::length(&permissions);
        
        while (i < len) {
            let required_perm = *vector::borrow(&permissions, i);
            if ((capability.permission_level & required_perm) != required_perm) {
                return false
            };
            i = i + 1;
        };
        
        true
    }

    /// 权限组合检查 - 是否包含任一指定权限
    public fun has_any_permission(
        capability: &AccessCapability,
        permissions: vector<u64>
    ): bool {
        let mut i = 0;
        let len = vector::length(&permissions);
        
        while (i < len) {
            let required_perm = *vector::borrow(&permissions, i);
            if ((capability.permission_level & required_perm) == required_perm) {
                return true
            };
            i = i + 1;
        };
        
        false
    }
}