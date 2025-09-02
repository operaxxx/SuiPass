#[allow(duplicate_alias)]
module suipass::vault_registry {
    use sui::object;
    use sui::tx_context;
    use sui::event;
    use sui::clock::{Self, Clock};
    use std::string::String;

    /// 极限优化后的 Vault 注册表结构 - 仅存储最基本的指针信息
    public struct VaultRegistry has key {
        id: UID,
        owner: address,
        walrus_blob_id: String,        // 唯一的 Walrus blob ID 指针
        created_at: u64,
        version: u64,
    }

    /// Vault 创建事件 - 极限优化版本
    public struct VaultCreated has copy, drop {
        vault_id: ID,
        owner: address,
        walrus_blob_id: String,
        timestamp: u64,
    }

    /// Vault 更新事件
    public struct VaultUpdated has copy, drop {
        vault_id: ID,
        old_walrus_blob_id: String,
        new_walrus_blob_id: String,
        version: u64,
        timestamp: u64,
    }

    /// 创建新的 Vault 注册表 (极限优化版本)
    public fun create_vault_registry(
        walrus_blob_id: String,
        clock: &Clock,
        ctx: &mut TxContext
    ): VaultRegistry {
        let vault = VaultRegistry {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            walrus_blob_id,
            version: 1,
            created_at: clock::timestamp_ms(clock) / 1000,
        };
        
        // 发送创建事件
        event::emit(VaultCreated {
            vault_id: object::id(&vault),
            owner: tx_context::sender(ctx),
            walrus_blob_id,
            timestamp: clock::timestamp_ms(clock) / 1000,
        });
        
        vault
    }

    /// 更新 Vault 的 Walrus blob 引用 (极限优化版本)
    public fun update_vault_blob(
        vault: &mut VaultRegistry,
        new_walrus_blob_id: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(vault.owner == tx_context::sender(ctx), 0);
        
        let old_walrus_blob_id = vault.walrus_blob_id;
        vault.walrus_blob_id = new_walrus_blob_id;
        vault.version = vault.version + 1;
        
        // 发送更新事件
        event::emit(VaultUpdated {
            vault_id: object::id(vault),
            old_walrus_blob_id,
            new_walrus_blob_id,
            version: vault.version,
            timestamp: clock::timestamp_ms(clock) / 1000,
        });
    }

    /// 删除 Vault 注册表 (极限优化版本)
    public fun delete_vault_registry(
        vault: VaultRegistry,
        ctx: &mut TxContext
    ) {
        assert!(vault.owner == tx_context::sender(ctx), 0);
        let VaultRegistry { 
            id, 
            owner: _, 
            walrus_blob_id: _, 
            version: _, 
            created_at: _ 
        } = vault;
        object::delete(id);
    }

    /// 获取 Vault 信息 (极限优化版本)
    public fun vault_info(vault: &VaultRegistry): (String, u64) {
        (vault.walrus_blob_id, vault.version)
    }

    /// 验证所有权
    public fun is_owner(vault: &VaultRegistry, address: address): bool {
        vault.owner == address
    }

    /// 获取创建时间
    public fun created_at(vault: &VaultRegistry): u64 {
        vault.created_at
    }

    /// 获取版本号
    public fun version(vault: &VaultRegistry): u64 {
        vault.version
    }
}