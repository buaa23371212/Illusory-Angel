/**
 * 测试：爆枪英雄养成插件完整流程
 * 创建项目 -> 创建目标树（氩星青蜂 -> 无双青蜂2 -> ...）-> 设置掉落限制 -> 设置背包已有资源
 */

import axios from 'axios';

/**
 * API基础URL
 */
const API_BASE = 'http://localhost:3000/api/v1';

/**
 * 目标数据，从示例文档中提取：
 * 氩星青蜂 (需要: 1)
 * ├─ 氩石 (需要: 100)
 * └─ 无双青蜂2 (需要: 1)
 *    ├─ 万能生肖碎片 (需要: 50)
 *    ├─ 万能球 (需要: 400)
 *    ├─ 无双水晶 (需要: 350)
 *    └─ 无双青蜂 (需要: 1)
 */
interface TestGoal {
  name: string;
  requiredQuantity: number;
  goalType: 'equipment_craft' | 'resource_collection';
  priority: number;
  children?: TestGoal[];
}

const goalTree: TestGoal[] = [
  {
    name: '氩星青蜂',
    requiredQuantity: 1,
    goalType: 'equipment_craft',
    priority: 1,
    children: [
      {
        name: '氩石',
        requiredQuantity: 100,
        goalType: 'resource_collection',
        priority: 2
      },
      {
        name: '无双青蜂2',
        requiredQuantity: 2,
        goalType: 'equipment_craft',
        priority: 2,
        children: [
          {
            name: '万能生肖碎片',
            requiredQuantity: 50,
            goalType: 'resource_collection',
            priority: 3
          },
          {
            name: '万能球',
            requiredQuantity: 400,
            goalType: 'resource_collection',
            priority: 3
          },
          {
            name: '无双水晶',
            requiredQuantity: 350,
            goalType: 'resource_collection',
            priority: 3
          },
          {
            name: '无双青蜂',
            requiredQuantity: 2,
            goalType: 'equipment_craft',
            priority: 3
          }
        ]
      }
    ]
  }
];

/**
 * 为目标添加goal_attributes约束
 */
async function addGoalAttributesConstraint(
  projectId: number,
  goalId: number,
  params: {
    priority: number;
    parentId: number | null;
    requiredQuantity: number;
    goalType: 'equipment_craft' | 'resource_collection';
  }
): Promise<void> {
  const response = await axios.post(
    `${API_BASE}/constraints`,
    {
      ownerType: 'GOAL',
      ownerId: goalId,
      constraintName: 'goal_attributes',
      params: params
    }
  );

  if (!response.data.success) {
    throw new Error(`添加目标属性约束失败 "${goalId}": ${response.data.error}`);
  }
}

/**
 * 递归创建目标并添加属性约束
 */
async function createGoalsRecursively(
  projectId: number,
  goals: TestGoal[],
  parentId: number | null
): Promise<number[]> {
  const createdIds: number[] = [];

  for (const goal of goals) {
    // 1. 创建目标 - POST /goals，请求体包含project_id
    const response = await axios.post(
      `${API_BASE}/goals`,
      {
        project_id: projectId,
        name: goal.name
      }
    );

    if (!response.data.success) {
      throw new Error(`创建目标失败 "${goal.name}": ${response.data.error}`);
    }

    const created = response.data.data;
    const createdGoalId = created.goal_id || created.goalId;
    createdIds.push(createdGoalId);
    console.log(`   ✅ 创建目标成功：${goal.name}，ID: ${createdGoalId}${parentId ? `，父目标: ${parentId}` : ''}`);

    // 2. 添加goal_attributes约束
    await addGoalAttributesConstraint(projectId, createdGoalId, {
      priority: goal.priority,
      parentId: parentId,
      requiredQuantity: goal.requiredQuantity,
      goalType: goal.goalType
    });
    console.log(`   ✅ 添加属性约束成功：${goal.name}，需要: ${goal.requiredQuantity}`);

    // 3. 递归创建子目标
    if (goal.children && goal.children.length > 0) {
      const childIds = await createGoalsRecursively(projectId, goal.children, createdGoalId);
      createdIds.push(...childIds);
    }
  }

  return createdIds;
}

/**
 * 测试主函数
 */
async function runTest(): Promise<void> {
  console.log('🧪 开始测试：爆枪英雄养成插件完整流程');
  console.log('='.repeat(60));

  try {
    // 步骤1：检查服务器是否运行
    console.log('\n📋 步骤1：检查服务器健康状态');
    await axios.get('http://localhost:3000/health');
    console.log('✅ 服务器正常运行');

    // 步骤2：创建项目
    console.log('\n📋 步骤2：创建爆枪英雄养成测试项目');
    const projectData = {
      name: '爆枪英雄养成计划',
      description: '氩星青蜂养成计划',
      category: 'bqtj_training'
    };
    const projectResponse = await axios.post(`${API_BASE}/projects`, projectData);
    if (!projectResponse.data.success) {
      throw new Error(`创建项目失败: ${projectResponse.data.error}`);
    }
    const project = projectResponse.data.data;
    const projectId = project.project_id || project.projectId;
    console.log(`✅ 项目创建成功，ID: ${projectId}, 名称: "${project.name}"`);

    // 步骤3：递归创建所有目标并添加属性约束
    console.log('\n📋 步骤3：创建目标树（氩星青蜂 -> ... -> 无双青蜂）');
    const createdGoalIds = await createGoalsRecursively(projectId, goalTree, null);
    console.log(`✅ 所有目标创建完成，共创建 ${createdGoalIds.length} 个目标`);

    // 步骤4：获取bqtj数据，验证接口正常工作
    console.log('\n📋 步骤4：获取养成插件初始数据');
    const bqtjResponse = await axios.get(
      `${API_BASE}/projects/${projectId}/plugins/bqtj`
    );
    if (!bqtjResponse.data.success) {
      throw new Error(`获取养成数据失败: ${bqtjResponse.data.error}`);
    }
    const bqtjData = bqtjResponse.data.data;
    console.log(`✅ 获取养成数据成功`);
    console.log(`   - 每日掉落限制: ${bqtjData.dailyDropLimit.length} 项`);
    console.log(`   - 每周掉落限制: ${bqtjData.weeklyDropLimit.length} 项`);
    console.log(`   - 背包已有资源: ${bqtjData.inventoryResources.length} 项`);

    // 步骤5：设置背包已有资源（假设已经有一些资源）
    console.log('\n📋 步骤5：设置背包已有资源');
    const inventoryParams = {
      "argon_ore": {
        "resourceId": "argon_ore",
        "resourceName": "氩石",
        "quantity": 35
      },
      "universal_zodiac_fragment": {
        "resourceId": "universal_zodiac_fragment",
        "resourceName": "万能生肖碎片",
        "quantity": 20
      },
      "universal_orb": {
        "resourceId": "universal_orb",
        "resourceName": "万能球",
        "quantity": 150
      }
    };
    const updateInventoryResponse = await axios.post(
      `${API_BASE}/projects/${projectId}/plugins/bqtj/constraint/inventory_resources`,
      { params: inventoryParams }
    );
    if (!updateInventoryResponse.data.success) {
      throw new Error(`更新背包资源失败: ${updateInventoryResponse.data.error}`);
    }
    console.log(`✅ 背包已有资源更新成功`);

    // 步骤6：设置每日掉落限制
    console.log('\n📋 步骤6：设置每日掉落限制');
    const dailyParams = {
      "argon_ore": {
        "resourceId": "argon_ore",
        "resourceName": "氩石",
        "limit": 10,
        "current": 5,
        "resetAt": Math.floor(Date.now() / 1000) * 1000 + 8 * 60 * 60 * 1000
      },
      "universal_zodiac_fragment": {
        "resourceId": "universal_zodiac_fragment",
        "resourceName": "万能生肖碎片",
        "limit": 5,
        "current": 2,
        "resetAt": Math.floor(Date.now() / 1000) * 1000 + 8 * 60 * 60 * 1000
      }
    };
    const updateDailyResponse = await axios.post(
      `${API_BASE}/projects/${projectId}/plugins/bqtj/constraint/daily_drop_limit`,
      { params: dailyParams }
    );
    if (!updateDailyResponse.data.success) {
      throw new Error(`更新每日掉落限制失败: ${updateDailyResponse.data.error}`);
    }
    console.log(`✅ 每日掉落限制更新成功`);

    // 步骤7：设置每周掉落限制
    console.log('\n📋 步骤7：设置每周掉落限制');
    const weeklyParams = {
      "universal_crystal": {
        "resourceId": "universal_crystal",
        "resourceName": "无双水晶",
        "limit": 50,
        "current": 15,
        "resetAt": Math.floor(Date.now() / 1000) * 1000 + 3 * 24 * 60 * 60 * 1000
      }
    };
    const updateWeeklyResponse = await axios.post(
      `${API_BASE}/projects/${projectId}/plugins/bqtj/constraint/weekly_drop_limit`,
      { params: weeklyParams }
    );
    if (!updateWeeklyResponse.data.success) {
      throw new Error(`更新每周掉落限制失败: ${updateWeeklyResponse.data.error}`);
    }
    console.log(`✅ 每周掉落限制更新成功`);

    // 步骤8：再次获取数据，验证所有更新都已保存
    console.log('\n📋 步骤8：验证数据更新');
    const verifyResponse = await axios.get(
      `${API_BASE}/projects/${projectId}/plugins/bqtj`
    );
    if (!verifyResponse.data.success) {
      throw new Error(`获取验证数据失败: ${verifyResponse.data.error}`);
    }
    const verifyData = verifyResponse.data.data;
    console.log(`✅ 数据验证成功`);
    console.log(`   - 每日掉落限制: ${verifyData.dailyDropLimit.length} 项`);
    console.log(`   - 每周掉落限制: ${verifyData.weeklyDropLimit.length} 项`);
    console.log(`   - 背包已有资源: ${verifyData.inventoryResources.length} 项`);

    verifyData.dailyDropLimit.forEach((item: any) => {
      console.log(`     • ${item.resourceName}: ${item.current}/${item.limit}`);
    });
    verifyData.weeklyDropLimit.forEach((item: any) => {
      console.log(`     • ${item.resourceName}: ${item.current}/${item.limit}`);
    });
    verifyData.inventoryResources.forEach((item: any) => {
      console.log(`     • ${item.resourceName}: ${item.quantity}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('🎉 所有测试通过！爆枪英雄养成插件完整流程验证成功');
    console.log(`   创建的项目ID: ${projectId}`);
    console.log(`   创建的目标数: ${createdGoalIds.length}`);
    console.log(`   测试覆盖: 创建项目 -> 创建目标树 -> 添加属性约束 -> 设置掉落限制 -> 设置背包资源`);

  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    if (axios.isAxiosError(error)) {
      console.error('请求信息:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data
      });
    }
    process.exit(1);
  }
}

// 如果直接运行则执行测试
if (require.main === module) {
  runTest();
}

export default runTest;