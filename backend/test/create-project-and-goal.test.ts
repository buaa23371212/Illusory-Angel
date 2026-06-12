/**
 * 测试：创建项目 -> 创建目标 -> 将目标标记为完成
 * 完整流程测试
 */

import axios from 'axios';

/**
 * API基础URL
 */
const API_BASE = 'http://localhost:3000/api/v1';

/**
 * 测试主函数
 */
async function runTest(): Promise<void> {
  console.log('🧪 开始测试：创建项目 -> 创建目标 -> 标记完成');
  console.log('=' .repeat(50));

  try {
    // 步骤1：检查服务器是否运行
    console.log('\n📋 步骤1：检查服务器健康状态');
    await axios.get('http://localhost:3000/health');
    console.log('✅ 服务器正常运行');

    // 步骤2：创建项目
    console.log('\n📋 步骤2：创建测试项目');
    const projectData = {
      name: '测试项目',
      description: '这是一个用于测试的项目',
      category: '测试'
    };
    const projectResponse = await axios.post(`${API_BASE}/projects`, projectData);
    if (!projectResponse.data.success) {
      throw new Error(`创建项目失败: ${projectResponse.data.error}`);
    }
    const project = projectResponse.data.data;
    console.log(`✅ 项目创建成功，ID: ${project.projectId}, 名称: "${project.name}"`);

    // 步骤3：在项目下创建目标
    console.log('\n📋 步骤3：创建测试目标');
    const goalData = {
      projectId: project.projectId,
      name: '测试目标',
      description: '这是一个需要完成的测试目标',
      priority: 1
    };
    const goalResponse = await axios.post(`${API_BASE}/goals/projects/${project.projectId}/goals`, goalData);
    if (!goalResponse.data.success) {
      throw new Error(`创建目标失败: ${goalResponse.data.error}`);
    }
    const goal = goalResponse.data.data;
    console.log(`✅ 目标创建成功，ID: ${goal.goalId}, 名称: "${goal.name}"`);
    console.log(`   当前完成状态: ${goal.isCompleted}`);

    // 步骤4：获取项目下的所有目标，验证创建成功
    console.log('\n📋 步骤4：验证目标创建');
    const goalsResponse = await axios.get(`${API_BASE}/goals/projects/${project.projectId}/goals`);
    if (!goalsResponse.data.success) {
      throw new Error(`获取目标列表失败: ${goalsResponse.data.error}`);
    }
    const goals = goalsResponse.data.data;
    console.log(`✅ 项目下共有 ${goals.length} 个目标`);

    // 步骤5：将目标标记为完成
    console.log('\n📋 步骤5：将目标标记为完成');
    const toggleResponse = await axios.patch(`${API_BASE}/goals/${goal.goalId}/toggle-completed`);
    if (!toggleResponse.data.success) {
      throw new Error(`切换目标状态失败: ${toggleResponse.data.error}`);
    }
    const updatedGoal = toggleResponse.data.data;
    console.log(`✅ 目标状态切换成功`);
    console.log(`   新的完成状态: ${updatedGoal.isCompleted}`);

    // 步骤6：验证目标状态已更新
    console.log('\n📋 步骤6：验证目标状态更新');
    const verifyResponse = await axios.get(`${API_BASE}/goals/${goal.goalId}`);
    if (!verifyResponse.data.success) {
      throw new Error(`获取目标信息失败: ${verifyResponse.data.error}`);
    }
    const verifiedGoal = verifyResponse.data.data;
    if (verifiedGoal.isCompleted) {
      console.log('✅ 验证通过：目标已成功标记为完成');
    } else {
      throw new Error('验证失败：目标状态未更新为完成');
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 所有测试通过！完整流程验证成功');
    console.log(`   创建的项目ID: ${project.projectId}`);
    console.log(`   创建的目标ID: ${goal.goalId}`);
    console.log(`   最终状态: 已完成`);

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