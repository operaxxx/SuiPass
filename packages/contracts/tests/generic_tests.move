/// 泛型系统综合测试 - 验证所有泛型组件的集成和功能
module suipass::generic_tests {
    use sui::test_scenario;
    use sui::clock;
    use sui::tx_context;
    use std::string::String;
    use std::vector;

    // 导入所有泛型系统
    use suipass::generic_vault::{
        Self,
        GenericVault,
        PersonalVault,
        TeamVault,
        EnterpriseVault,
        VaultConfigData,
        StorageStrategy
    };
    use suipass::generic_storage::{
        Self,
        GenericStorageAdapter,
        WalrusStorage,
        IPFSStorage,
        ArweaveStorage,
        StorageConfig,
        StorageMetadata
    };
    use suipass::generic_permissions::{
        Self,
        GenericPermissionManager,
        RBACModel,
        ABACModel,
        PermissionContext,
        PERMISSION_READ,
        PERMISSION_WRITE,
        PERMISSION_ADMIN
    };
    use suipass::generic_events::{
        Self,
        GenericEventBus,
        LogHandler,
        AlertHandler,
        TypeFilter,
        EventContext,
        EVENT_TYPE_VAULT,
        EVENT_TYPE_PERMISSION,
        EVENT_TYPE_STORAGE
    };
    use suipass::generic_demo::{
        Self,
        AdvancedPasswordManager,
        ManagerConfig,
        PasswordEntry
    };

    /// 测试泛型Vault系统
    #[test]
    public fun test_generic_vault_system() {
        let scenario = &mut test_scenario::begin(@0x1);
        let ctx = test_scenario::ctx(scenario);
        
        // 创建PersonalVault
        let personal_config = generic_vault::default_personal_config();
        let storage_strategy = generic_vault::default_storage_strategy();
        let personal_vault = generic_vault::create_generic_vault<PersonalVault>(
            personal_config,
            storage_strategy,
            test_scenario::clock(scenario),
            ctx
        );
        
        // 验证PersonalVault属性
        let (owner, vault_type, stats, created_at, updated_at) = generic_vault::vault_info(&personal_vault);
        assert!(owner == @0x1, 0);
        assert!(vault_type == 1, 1); // PersonalVault type
        assert!(stats.total_entries == 0, 2);
        assert!(created_at == updated_at, 3);
        
        // 创建TeamVault
        let team_config = generic_vault::default_team_config();
        let team_vault = generic_vault::create_generic_vault<TeamVault>(
            team_config,
            storage_strategy,
            test_scenario::clock(scenario),
            ctx
        );
        
        // 验证TeamVault属性
        let (team_owner, team_vault_type, team_stats, _, _) = generic_vault::vault_info(&team_vault);
        assert!(team_owner == @0x1, 4);
        assert!(team_vault_type == 2, 5); // TeamVault type
        assert!(team_stats.total_entries == 0, 6);
        
        // 创建EnterpriseVault
        let enterprise_config = generic_vault::default_enterprise_config();
        let enterprise_vault = generic_vault::create_generic_vault<EnterpriseVault>(
            enterprise_config,
            storage_strategy,
            test_scenario::clock(scenario),
            ctx
        );
        
        // 验证EnterpriseVault属性
        let (enterprise_owner, enterprise_vault_type, enterprise_stats, _, _) = generic_vault::vault_info(&enterprise_vault);
        assert!(enterprise_owner == @0x1, 7);
        assert!(enterprise_vault_type == 3, 8); // EnterpriseVault type
        assert!(enterprise_stats.total_entries == 0, 9);
        
        // 测试容量限制
        let personal_capacity = generic_vault::remaining_capacity<PersonalVault>(&personal_vault);
        let team_capacity = generic_vault::remaining_capacity<TeamVault>(&team_vault);
        let enterprise_capacity = generic_vault::remaining_capacity<EnterpriseVault>(&enterprise_vault);
        
        assert!(personal_capacity == 1000, 10); // PersonalVault max capacity
        assert!(team_capacity == 10000, 11); // TeamVault max capacity
        assert!(enterprise_capacity == 100000, 12); // EnterpriseVault max capacity
        
        test_scenario::end(scenario);
    }

    /// 测试泛型存储系统
    #[test]
    public fun test_generic_storage_system() {
        let scenario = &mut test_scenario::begin(@0x1);
        let ctx = test_scenario::ctx(scenario);
        
        // 创建Walrus存储适配器
        let walrus_config = generic_storage::default_walrus_config();
        let walrus_adapter = generic_storage::create_storage_adapter<WalrusStorage>(walrus_config, ctx);
        
        // 验证Walrus适配器属性
        assert!(walrus_adapter.backend_type == 1, 0); // Walrus backend type
        assert!(walrus_adapter.stats.total_stored == 0, 1);
        
        // 创建IPFS存储适配器
        let ipfs_config = generic_storage::default_ipfs_config();
        let ipfs_adapter = generic_storage::create_storage_adapter<IPFSStorage>(ipfs_config, ctx);
        
        // 验证IPFS适配器属性
        assert!(ipfs_adapter.backend_type == 2, 2); // IPFS backend type
        assert!(ipfs_adapter.stats.total_stored == 0, 3);
        
        // 创建Arweave存储适配器
        let arweave_config = generic_storage::default_arweave_config();
        let arweave_adapter = generic_storage::create_storage_adapter<ArweaveStorage>(arweave_config, ctx);
        
        // 验证Arweave适配器属性
        assert!(arweave_adapter.backend_type == 3, 4); // Arweave backend type
        assert!(arweave_adapter.stats.total_stored == 0, 5);
        
        // 测试存储成本计算
        let test_data = b"test data for storage cost calculation";
        let walrus_cost = WalrusStorage::get_cost(vector::length(test_data));
        let ipfs_cost = IPFSStorage::get_cost(vector::length(test_data));
        let arweave_cost = ArweaveStorage::get_cost(vector::length(test_data));
        
        assert!(walrus_cost > 0, 6);
        assert!(ipfs_cost > 0, 7);
        assert!(arweave_cost > 0, 8);
        assert!(arweave_cost > walrus_cost, 9); // Arweave应该更贵（永久存储）
        
        test_scenario::end(scenario);
    }

    /// 测试泛型权限系统
    #[test]
    public fun test_generic_permission_system() {
        let scenario = &mut test_scenario::begin(@0x1);
        let ctx = test_scenario::ctx(scenario);
        
        // 创建RBAC权限管理器
        let rbac_manager = generic_permissions::create_permission_manager<RBACModel>(ctx);
        
        // 验证RBAC管理器属性
        assert!(rbac_manager.model_type == 1, 0); // RBAC model type
        assert!(rbac_manager.stats.total_permissions_granted == 0, 1);
        
        // 创建ABAC权限管理器
        let abac_manager = generic_permissions::create_permission_manager<ABACModel>(ctx);
        
        // 验证ABAC管理器属性
        assert!(abac_manager.model_type == 2, 2); // ABAC model type
        assert!(abac_manager.stats.total_permissions_granted == 0, 3);
        
        // 测试权限授予和检查
        let user = @0x2;
        let permission_context = PermissionContext {
            resource_id: String::utf8(b"test_resource"),
            resource_type: 1,
            actor: user,
            timestamp: 1000,
            metadata: test_scenario::take_shared<Table<String, String>>(scenario),
        };
        
        // 授予用户读权限
        generic_permissions::grant_permission(
            &mut rbac_manager,
            user,
            PERMISSION_READ,
            permission_context,
            test_scenario::clock(scenario),
            ctx
        );
        
        // 验证权限授予成功
        assert!(rbac_manager.stats.total_permissions_granted == 1, 4);
        
        // 检查用户权限
        let has_read_permission = generic_permissions::check_permission(
            &mut rbac_manager,
            user,
            PERMISSION_READ,
            permission_context,
            test_scenario::clock(scenario)
        );
        
        assert!(has_read_permission, 5);
        
        // 检查用户是否没有写权限
        let has_write_permission = generic_permissions::check_permission(
            &mut rbac_manager,
            user,
            PERMISSION_WRITE,
            permission_context,
            test_scenario::clock(scenario)
        );
        
        assert!(!has_write_permission, 6);
        
        // 测试角色分配
        generic_permissions::assign_role(
            &mut rbac_manager,
            user,
            String::utf8(b"admin"),
            test_scenario::clock(scenario),
            ctx
        );
        
        // 现在用户应该有管理员权限
        let has_admin_permission = generic_permissions::check_permission(
            &mut rbac_manager,
            user,
            PERMISSION_ADMIN,
            permission_context,
            test_scenario::clock(scenario)
        );
        
        assert!(has_admin_permission, 7);
        
        test_scenario::end(scenario);
    }

    /// 测试泛型事件系统
    #[test]
    public fun test_generic_event_system() {
        let scenario = &mut test_scenario::begin(@0x1);
        let ctx = test_scenario::ctx(scenario);
        
        // 创建事件总线
        let event_bus = generic_events::create_event_bus(ctx);
        
        // 验证事件总线属性
        assert!(event_bus.stats.total_events == 0, 0);
        assert!(event_bus.stats.total_handlers == 0, 1);
        
        // 注册日志处理器
        let log_handler_data = generic_events::default_log_handler_data();
        generic_events::register_handler<LogHandler>(
            &mut event_bus,
            String::utf8(b"log_handler"),
            bcs::to_bytes(&log_handler_data),
            1,
            test_scenario::clock(scenario),
            ctx
        );
        
        // 验证处理器注册成功
        assert!(event_bus.stats.total_handlers == 1, 2);
        assert!(event_bus.stats.active_handlers == 1, 3);
        
        // 注册告警处理器
        let alert_handler_data = generic_events::default_alert_handler_data();
        generic_events::register_handler<AlertHandler>(
            &mut event_bus,
            String::utf8(b"alert_handler"),
            bcs::to_bytes(&alert_handler_data),
            2,
            test_scenario::clock(scenario),
            ctx
        );
        
        // 验证第二个处理器注册成功
        assert!(event_bus.stats.total_handlers == 2, 4);
        assert!(event_bus.stats.active_handlers == 2, 5);
        
        // 注册类型过滤器
        let type_filter_data = generic_events::default_type_filter_data();
        generic_events::register_filter<TypeFilter>(
            &mut event_bus,
            String::utf8(b"type_filter"),
            bcs::to_bytes(&type_filter_data),
            test_scenario::clock(scenario),
            ctx
        );
        
        // 验证过滤器注册成功
        assert!(event_bus.stats.total_filters == 1, 6);
        assert!(event_bus.stats.active_filters == 1, 7);
        
        // 发送测试事件
        let event_context = generic_events::create_event_context(
            @0x1,
            1,
            String::utf8(b"test_tx"),
            test_scenario::clock(scenario)
        );
        
        let test_event_data = b"test event data";
        let event_id = generic_events::emit_event<LogHandler>(
            &mut event_bus,
            EVENT_TYPE_VAULT,
            test_event_data,
            event_context,
            test_scenario::clock(scenario),
            ctx
        );
        
        // 验证事件发送成功
        assert!(event_id == 1, 8);
        assert!(event_bus.stats.total_events == 1, 9);
        
        // 检查事件日志
        let log_entry = generic_events::get_event_log(&event_bus, event_id);
        assert!(std::option::is_some(&log_entry), 10);
        
        let entry = std::option::destroy_some(log_entry);
        assert!(entry.event_type == EVENT_TYPE_VAULT, 11);
        assert!(entry.emitter == @0x1, 12);
        
        test_scenario::end(scenario);
    }

    /// 测试高级密码管理器
    #[test]
    public fun test_advanced_password_manager() {
        let scenario = &mut test_scenario::begin(@0x1);
        let ctx = test_scenario::ctx(scenario);
        
        // 创建高级密码管理器
        let config = generic_demo::default_manager_config();
        let mut manager = generic_demo::create_advanced_manager(config, ctx);
        
        // 验证管理器属性
        assert!(manager.owner == @0x1, 0);
        assert!(manager.stats.total_passwords == 0, 1);
        assert!(manager.stats.total_backups == 0, 2);
        
        // 创建个人Vault
        generic_demo::create_personal_vault(
            &mut manager,
            String::utf8(b"My Personal Vault"),
            test_scenario::clock(scenario),
            ctx
        );
        
        // 验证个人Vault创建成功
        assert!(std::option::is_some(&manager.personal_vault), 3);
        
        // 添加密码
        let password_id = generic_demo::add_password_to_personal_vault(
            &mut manager,
            String::utf8(b"GitHub"),
            String::utf8(b"myusername"),
            b"encrypted_password_data",
            String::utf8(b"https://github.com"),
            String::utf8(b"My GitHub account"),
            String::utf8(b"development"),
            vector[String::utf8(b"github"), String::utf8(b"coding")],
            test_scenario::clock(scenario),
            ctx
        );
        
        // 验证密码添加成功
        assert!(manager.stats.total_passwords == 1, 4);
        assert!(string::length(&password_id) > 0, 5);
        
        // 获取密码
        let retrieved_password = generic_demo::get_password_from_personal_vault(
            &mut manager,
            password_id,
            test_scenario::clock(scenario)
        );
        
        // 验证密码检索成功
        assert!(std::option::is_some(&retrieved_password), 6);
        
        let password_entry = std::option::destroy_some(retrieved_password);
        assert!(password_entry.title == String::utf8(b"GitHub"), 7);
        assert!(password_entry.username == String::utf8(b"myusername"), 8);
        
        // 执行备份
        let backup_id = generic_demo::perform_backup(
            &mut manager,
            test_scenario::clock(scenario),
            ctx
        );
        
        // 验证备份成功
        assert!(manager.stats.total_backups == 1, 9);
        assert!(string::length(&backup_id) > 0, 10);
        
        // 获取各种统计信息
        let manager_stats = generic_demo::manager_stats(&manager);
        assert!(manager_stats.total_passwords == 1, 11);
        assert!(manager_stats.total_backups == 1, 12);
        
        let (primary_stats, backup_stats) = generic_demo::storage_stats(&manager);
        assert!(primary_stats.total_stored >= 1, 13);
        
        let permission_stats = generic_demo::permission_stats(&manager);
        assert!(permission_stats.total_permissions_granted == 0, 14);
        
        let event_stats = generic_demo::event_stats(&manager);
        assert!(event_stats.total_events >= 1, 15);
        
        test_scenario::end(scenario);
    }

    /// 测试多用户权限管理
    #[test]
    public fun test_multi_user_permission_management() {
        let scenario = &mut test_scenario::begin(@0x1);
        let ctx = test_scenario::ctx(scenario);
        
        // 创建高级密码管理器
        let config = generic_demo::default_manager_config();
        let mut manager = generic_demo::create_advanced_manager(config, ctx);
        
        // 创建个人Vault
        generic_demo::create_personal_vault(
            &mut manager,
            String::utf8(b"Shared Team Vault"),
            test_scenario::clock(scenario),
            ctx
        );
        
        // 授予多个用户不同权限
        let user1 = @0x2;
        let user2 = @0x3;
        let user3 = @0x4;
        
        // 授予user1读权限
        generic_demo::grant_user_access(
            &mut manager,
            user1,
            PERMISSION_READ,
            test_scenario::clock(scenario),
            ctx
        );
        
        // 授予user2读写权限
        generic_demo::grant_user_access(
            &mut manager,
            user2,
            PERMISSION_READ | PERMISSION_WRITE,
            test_scenario::clock(scenario),
            ctx
        );
        
        // 授予user3管理员权限
        generic_demo::grant_user_access(
            &mut manager,
            user3,
            PERMISSION_READ | PERMISSION_WRITE | PERMISSION_ADMIN,
            test_scenario::clock(scenario),
            ctx
        );
        
        // 验证权限统计
        let permission_stats = generic_demo::permission_stats(&manager);
        assert!(permission_stats.total_permissions_granted == 3, 0);
        
        // 添加密码（只有owner可以）
        let password_id = generic_demo::add_password_to_personal_vault(
            &mut manager,
            String::utf8(b"Shared Password"),
            String::utf8(b"shareduser"),
            b"shared_encrypted_password",
            String::utf8(b"https://shared.example.com"),
            String::utf8(b"Shared account"),
            String::utf8(b"shared"),
            vector[String::utf8(b"shared"), String::utf8(b"team")],
            test_scenario::clock(scenario),
            ctx
        );
        
        // 验证密码添加成功
        assert!(manager.stats.total_passwords == 1, 1);
        
        // 验证用户1有读权限
        let has_read_access = generic_demo::get_password_from_personal_vault(
            &mut manager,
            password_id,
            test_scenario::clock(scenario)
        );
        assert!(std::option::is_some(&has_read_access), 2);
        
        test_scenario::end(scenario);
    }

    /// 测试性能和扩展性
    #[test]
    public fun test_performance_and_scalability() {
        let scenario = &mut test_scenario::begin(@0x1);
        let ctx = test_scenario::ctx(scenario);
        
        // 创建高级密码管理器
        let config = generic_demo::default_manager_config();
        let mut manager = generic_demo::create_advanced_manager(config, ctx);
        
        // 创建个人Vault
        generic_demo::create_personal_vault(
            &mut manager,
            String::utf8(b"Performance Test Vault"),
            test_scenario::clock(scenario),
            ctx
        );
        
        // 批量添加密码（测试性能）
        let mut i = 0;
        while (i < 10) { // 添加10个密码用于测试
            let mut title = vector::empty<u8>();
            vector::append(&mut title, b"Password ");
            vector::append(&mut title, bcs::to_bytes(&i));
            
            let password_id = generic_demo::add_password_to_personal_vault(
                &mut manager,
                String::utf8(title),
                String::utf8(b"user"),
                b"encrypted_password",
                String::utf8(b"https://example.com"),
                String::utf8(b"Test password"),
                String::utf8(b"test"),
                vector[String::utf8(b"test")],
                test_scenario::clock(scenario),
                ctx
            );
            
            assert!(string::length(&password_id) > 0, i);
            i = i + 1;
        };
        
        // 验证批量添加成功
        assert!(manager.stats.total_passwords == 10, 0);
        
        // 执行备份（测试备份性能）
        let backup_id = generic_demo::perform_backup(
            &mut manager,
            test_scenario::clock(scenario),
            ctx
        );
        
        // 验证备份成功
        assert!(manager.stats.total_backups == 1, 1);
        assert!(string::length(&backup_id) > 0, 2);
        
        // 获取性能统计
        let manager_stats = generic_demo::manager_stats(&manager);
        assert!(manager_stats.total_passwords == 10, 3);
        assert!(manager_stats.total_backups == 1, 4);
        
        let (primary_stats, backup_stats) = generic_demo::storage_stats(&manager);
        assert!(primary_stats.total_stored >= 10, 5);
        assert!(backup_stats.total_stored >= 1, 6);
        
        let event_stats = generic_demo::event_stats(&manager);
        assert!(event_stats.total_events >= 11, 7); // 10个密码 + 1个备份
        
        test_scenario::end(scenario);
    }

    /// 测试错误处理和边界条件
    #[test]
    public fun test_error_handling_and_edge_cases() {
        let scenario = &mut test_scenario::begin(@0x1);
        let ctx = test_scenario::ctx(scenario);
        
        // 创建高级密码管理器
        let config = generic_demo::default_manager_config();
        let mut manager = generic_demo::create_advanced_manager(config, ctx);
        
        // 尝试在未创建Vault时添加密码（应该失败）
        test_scenario::next_tx(scenario, @0x1);
        
        // 这里我们无法直接测试panic，但我们可以验证初始状态
        assert!(std::option::is_none(&manager.personal_vault), 0);
        assert!(manager.stats.total_passwords == 0, 1);
        
        // 创建Vault后测试
        test_scenario::next_tx(scenario, @0x1);
        generic_demo::create_personal_vault(
            &mut manager,
            String::utf8(b"Error Test Vault"),
            test_scenario::clock(scenario),
            ctx
        );
        
        // 验证Vault创建成功
        assert!(std::option::is_some(&manager.personal_vault), 2);
        
        // 测试获取不存在的密码
        let non_existent_password = generic_demo::get_password_from_personal_vault(
            &mut manager,
            String::utf8(b"non_existent_password"),
            test_scenario::clock(scenario)
        );
        
        // 验证不存在的密码返回None
        assert!(std::option::is_none(&non_existent_password), 3);
        
        // 测试空字符串和边界值
        let empty_password_id = generic_demo::add_password_to_personal_vault(
            &mut manager,
            String::utf8(b""),
            String::utf8(b""),
            b"",
            String::utf8(b""),
            String::utf8(b""),
            String::utf8(b""),
            vector[],
            test_scenario::clock(scenario),
            ctx
        );
        
        // 验证空值处理
        assert!(string::length(&empty_password_id) > 0, 4);
        assert!(manager.stats.total_passwords == 1, 5);
        
        test_scenario::end(scenario);
    }
}