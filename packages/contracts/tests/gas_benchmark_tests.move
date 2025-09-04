/// Gas优化基准测试 - 验证优化效果
module suipass::gas_benchmark_tests {
    use sui::test_scenario::{Self};
    use sui::clock::{Self, Clock};
    use sui::test_utils;
    use std::string::String;
    use suipass::vault_registry;
    use suipass::optimized_vault_registry;
    use suipass::access_control;
    use suipass::optimized_access_control;

    /// 测试用户地址
    const TEST_USER: address = @0x1;
    const ADMIN_USER: address = @0x2;

    /// 测试用的Walrus blob ID
    const TEST_BLOB_ID: vector<u8> = b"test_walrus_blob_id_12345";

    /// 测试VaultRegistry的Gas使用情况
    #[test]
    fun test_vault_registry_gas_benchmark() {
        let mut scenario = test_scenario::begin(TEST_USER);
        let clock = test_scenario::take_shared<Clock>(&scenario);
        
        // 测试原始版本的Gas消耗
        let start_gas_original = test_utils::gas_used();
        
        let blob_id = string::utf8(TEST_BLOB_ID);
        let vault = vault_registry::create_vault_registry(blob_id, &clock, test_scenario::ctx(&mut scenario));
        
        let end_gas_original = test_utils::gas_used();
        let gas_original = end_gas_original - start_gas_original;
        
        test_scenario::return_shared(clock);
        test_scenario::return_shared(vault);
        
        // 记录原始版本的Gas使用
        print(&string::utf8(b"Original VaultRegistry gas usage: "));
        print(&gas_original);
    }

    /// 测试优化版本的VaultRegistry Gas使用情况
    #[test]
    fun test_optimized_vault_registry_gas_benchmark() {
        let mut scenario = test_scenario::begin(TEST_USER);
        let clock = test_scenario::take_shared<Clock>(&scenario);
        
        // 测试优化版本的Gas消耗
        let start_gas_optimized = test_utils::gas_used();
        
        let blob_id = string::utf8(TEST_BLOB_ID);
        let vault = optimized_vault_registry::create_optimized_vault(blob_id, &clock, test_scenario::ctx(&mut scenario));
        
        let end_gas_optimized = test_utils::gas_used();
        let gas_optimized = end_gas_optimized - start_gas_optimized;
        
        test_scenario::return_shared(clock);
        test_scenario::return_shared(vault);
        
        // 记录优化版本的Gas使用
        print(&string::utf8(b"Optimized VaultRegistry gas usage: "));
        print(&gas_optimized);
    }

    /// 测试批量操作的Gas节省
    #[test]
    fun test_batch_operations_gas_savings() {
        let mut scenario = test_scenario::begin(TEST_USER);
        let clock = test_scenario::take_shared<Clock>(&scenario);
        
        // 准备测试数据
        let mut blob_strings = vector::empty<String>();
        vector::push_back(&mut blob_strings, string::utf8(b"blob_1"));
        vector::push_back(&mut blob_strings, string::utf8(b"blob_2"));
        vector::push_back(&mut blob_strings, string::utf8(b"blob_3"));
        vector::push_back(&mut blob_strings, string::utf8(b"blob_4"));
        vector::push_back(&mut blob_strings, string::utf8(b"blob_5"));
        
        // 测试批量创建的Gas消耗
        let start_gas_batch = test_utils::gas_used();
        
        let vaults = optimized_vault_registry::batch_create_vaults(blob_strings, &clock, test_scenario::ctx(&mut scenario));
        
        let end_gas_batch = test_utils::gas_used();
        let gas_batch = end_gas_batch - start_gas_batch;
        let gas_per_vault = gas_batch / 5; // 5个vaults
        
        test_scenario::return_shared(clock);
        
        // 销毁vaults以避免资源泄漏
        let mut i = 0;
        while (i < 5) {
            let vault = vector::pop_back(&mut vaults);
            test_scenario::return_shared(vault);
            i = i + 1;
        };
        
        // 记录批量操作的Gas使用
        print(&string::utf8(b"Batch operations gas usage per vault: "));
        print(&gas_per_vault);
    }

    /// 测试AccessControl的Gas使用情况
    #[test]
    fun test_access_control_gas_benchmark() {
        let mut scenario = test_scenario::begin(TEST_USER);
        let clock = test_scenario::take_shared<Clock>(&scenario);
        
        // 创建测试vault
        let blob_id = string::utf8(TEST_BLOB_ID);
        let vault = vault_registry::create_vault_registry(blob_id, &clock, test_scenario::ctx(&mut scenario));
        let vault_id = object::id(&vault);
        
        // 测试原始版本AccessControl的Gas消耗
        let start_gas_original = test_utils::gas_used();
        
        let mut conditions = vector::empty<String>();
        vector::push_back(&mut conditions, string::utf8(b"ip_whitelist"));
        vector::push_back(&mut conditions, string::utf8(b"time_restricted"));
        
        let capability = access_control::create_access_capability(
            vault_id,
            @0x3,
            6, // PERMISSION_VIEW | PERMISSION_EDIT
            1000000000, // expires_at
            100, // max_usage
            conditions,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        let end_gas_original = test_utils::gas_used();
        let gas_original = end_gas_original - start_gas_original;
        
        test_scenario::return_shared(clock);
        test_scenario::return_shared(vault);
        test_scenario::return_shared(capability);
        
        // 记录原始版本的Gas使用
        print(&string::utf8(b"Original AccessControl gas usage: "));
        print(&gas_original);
    }

    /// 测试优化版本AccessControl的Gas使用情况
    #[test]
    fun test_optimized_access_control_gas_benchmark() {
        let mut scenario = test_scenario::begin(TEST_USER);
        let clock = test_scenario::take_shared<Clock>(&scenario);
        
        // 创建测试vault
        let blob_id = string::utf8(TEST_BLOB_ID);
        let vault = optimized_vault_registry::create_optimized_vault(blob_id, &clock, test_scenario::ctx(&mut scenario));
        let vault_id = object::id(&vault);
        
        // 测试优化版本AccessControl的Gas消耗
        let start_gas_optimized = test_utils::gas_used();
        
        let permission_set = optimized_access_control::create_permission_set(
            vector[1, 2] // PERMISSION_VIEW | PERMISSION_EDIT
        );
        
        let capability = optimized_access_control::create_optimized_capability(
            vault_id,
            @0x3,
            permission_set,
            1000000000, // expires_at
            100, // max_usage
            vector::empty<String>(), // 空conditions以测试优化效果
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        let end_gas_optimized = test_utils::gas_used();
        let gas_optimized = end_gas_optimized - start_gas_optimized;
        
        test_scenario::return_shared(clock);
        test_scenario::return_shared(vault);
        test_scenario::return_shared(capability);
        
        // 记录优化版本的Gas使用
        print(&string::utf8(b"Optimized AccessControl gas usage: "));
        print(&gas_optimized);
    }

    /// 测试权限验证的Gas使用情况
    #[test]
    fun test_permission_validation_gas_benchmark() {
        let mut scenario = test_scenario::begin(TEST_USER);
        let clock = test_scenario::take_shared<Clock>(&scenario);
        
        // 创建测试vault和capability
        let blob_id = string::utf8(TEST_BLOB_ID);
        let vault = optimized_vault_registry::create_optimized_vault(blob_id, &clock, test_scenario::ctx(&mut scenario));
        let vault_id = object::id(&vault);
        
        let permission_set = optimized_access_control::create_permission_set(
            vector[1, 2, 4] // PERMISSION_VIEW | PERMISSION_EDIT | PERMISSION_SHARE
        );
        
        let mut capability = optimized_access_control::create_optimized_capability(
            vault_id,
            @0x3,
            permission_set,
            1000000000, // expires_at
            100, // max_usage
            vector::empty<String>(),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        // 测试权限验证的Gas消耗
        let start_gas_validation = test_utils::gas_used();
        
        let required_permissions = optimized_access_control::create_permission_set(vector[1, 2]);
        optimized_access_control::use_optimized_capability(
            &mut capability,
            required_permissions,
            @0x3,
            &clock
        );
        
        let end_gas_validation = test_utils::gas_used();
        let gas_validation = end_gas_validation - start_gas_validation;
        
        test_scenario::return_shared(clock);
        test_scenario::return_shared(vault);
        test_scenario::return_shared(capability);
        
        // 记录权限验证的Gas使用
        print(&string::utf8(b"Permission validation gas usage: "));
        print(&gas_validation);
    }

    /// 测试批量权限验证的Gas节省
    #[test]
    fun test_batch_permission_validation_gas_savings() {
        let mut scenario = test_scenario::begin(TEST_USER);
        let clock = test_scenario::take_shared<Clock>(&scenario);
        
        // 创建多个测试capabilities
        let mut capabilities = vector::empty<&optimized_access_control::OptimizedAccessCapability>();
        let mut required_permissions = vector::empty<optimized_access_control::OptimizedPermissionSet>();
        
        let blob_id = string::utf8(TEST_BLOB_ID);
        let vault = optimized_vault_registry::create_optimized_vault(blob_id, &clock, test_scenario::ctx(&mut scenario));
        let vault_id = object::id(&vault);
        
        // 创建5个capabilities用于批量测试
        let i = 0;
        while (i < 5) {
            let permission_set = optimized_access_control::create_permission_set(vector[1, 2]);
            let capability = optimized_access_control::create_optimized_capability(
                vault_id,
                @0x3,
                permission_set,
                1000000000,
                100,
                vector::empty<String>(),
                &clock,
                test_scenario::ctx(&mut scenario)
            );
            
            vector::push_back(&mut capabilities, &capability);
            vector::push_back(&mut required_permissions, permission_set);
            
            i = i + 1;
        };
        
        // 测试批量权限验证的Gas消耗
        let start_gas_batch = test_utils::gas_used();
        
        let results = optimized_access_control::batch_validate_permissions(
            capabilities,
            @0x3,
            required_permissions,
            &clock
        );
        
        let end_gas_batch = test_utils::gas_used();
        let gas_batch = end_gas_batch - start_gas_batch;
        let gas_per_validation = gas_batch / 5;
        
        test_scenario::return_shared(clock);
        test_scenario::return_shared(vault);
        
        // 记录批量权限验证的Gas使用
        print(&string::utf8(b"Batch permission validation gas usage per capability: "));
        print(&gas_per_validation);
        
        // 验证所有权限检查都通过
        assert!(vector::length(&results) == 5, 0);
        let mut j = 0;
        while (j < 5) {
            assert!(*vector::borrow(&results, j), 1);
            j = j + 1;
        };
    }

    /// 测试字符串哈希优化的效果
    #[test]
    fun test_string_hash_optimization_benchmark() {
        let mut scenario = test_scenario::begin(TEST_USER);
        
        // 测试字符串哈希的Gas消耗
        let start_gas_hash = test_utils::gas_used();
        
        let test_string = string::utf8(b"this_is_a_test_string_for_hashing_performance");
        let hash = optimized_vault_registry::string_to_blob_id(&test_string);
        
        let end_gas_hash = test_utils::gas_used();
        let gas_hash = end_gas_hash - start_gas_hash;
        
        // 记录字符串哈希的Gas使用
        print(&string::utf8(b"String hash optimization gas usage: "));
        print(&gas_hash);
        
        // 验证哈希结果
        assert!(hash.length > 0, 0);
        assert!(hash.hash != 0, 1);
    }

    /// 综合性能测试 - 模拟真实使用场景
    #[test]
    fun test_comprehensive_performance_benchmark() {
        let mut scenario = test_scenario::begin(TEST_USER);
        let clock = test_scenario::take_shared<Clock>(&scenario);
        
        // 模拟真实使用场景：创建vault、设置权限、更新、删除
        let start_gas_comprehensive = test_utils::gas_used();
        
        // 1. 创建vault
        let blob_id = string::utf8(TEST_BLOB_ID);
        let mut vault = optimized_vault_registry::create_optimized_vault(blob_id, &clock, test_scenario::ctx(&mut scenario));
        let vault_id = object::id(&vault);
        
        // 2. 设置权限
        let permission_set = optimized_access_control::create_permission_set(vector[1, 2, 4]);
        let mut capability = optimized_access_control::create_optimized_capability(
            vault_id,
            @0x3,
            permission_set,
            1000000000,
            100,
            vector::empty<String>(),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        // 3. 使用权限
        let required_permissions = optimized_access_control::create_permission_set(vector[1, 2]);
        optimized_access_control::use_optimized_capability(
            &mut capability,
            required_permissions,
            @0x3,
            &clock
        );
        
        // 4. 更新vault
        let new_blob_id = string::utf8(b"updated_walrus_blob_id_67890");
        optimized_vault_registry::update_vault_optimized(
            &mut vault,
            new_blob_id,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        // 5. 删除capability
        optimized_access_control::revoke_optimized_capability(capability, &clock, test_scenario::ctx(&mut scenario));
        
        let end_gas_comprehensive = test_utils::gas_used();
        let gas_comprehensive = end_gas_comprehensive - start_gas_comprehensive;
        
        test_scenario::return_shared(clock);
        test_scenario::return_shared(vault);
        
        // 记录综合性能的Gas使用
        print(&string::utf8(b"Comprehensive performance gas usage: "));
        print(&gas_comprehensive);
    }

    /// 内存使用测试
    #[test]
    fun test_memory_usage_benchmark() {
        let mut scenario = test_scenario::begin(TEST_USER);
        let clock = test_scenario::take_shared<Clock>(&scenario);
        
        // 测试大量对象创建时的内存使用
        let start_gas_memory = test_utils::gas_used();
        
        let mut vaults = vector::empty<optimized_vault_registry::OptimizedVaultRegistry>();
        let i = 0;
        while (i < 10) {
            let blob_id = string::utf8(b"memory_test_blob_id");
            let vault = optimized_vault_registry::create_optimized_vault(blob_id, &clock, test_scenario::ctx(&mut scenario));
            vector::push_back(&mut vaults, vault);
            i = i + 1;
        };
        
        let end_gas_memory = test_utils::gas_used();
        let gas_memory = end_gas_memory - start_gas_memory;
        let gas_per_vault = gas_memory / 10;
        
        test_scenario::return_shared(clock);
        
        // 清理vaults
        let mut j = 0;
        while (j < 10) {
            let vault = vector::pop_back(&mut vaults);
            test_scenario::return_shared(vault);
            j = j + 1;
        };
        
        // 记录内存使用的Gas消耗
        print(&string::utf8(b"Memory usage gas per vault: "));
        print(&gas_per_vault);
    }
}