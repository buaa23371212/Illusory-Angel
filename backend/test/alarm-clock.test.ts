/**
 * 闹钟提醒插件测试
 * 测试流程：
 * 1. 检查服务器健康状态
 * 2. 创建测试项目
 * 3. 创建测试目标
 * 4. 给该目标添加闹钟配置
 * 5. 获取闹钟配置验证结果
 * 6. 测试获取待触发闹钟列表
 * 7. 测试边界情况（不存在的闹钟、无效格式）
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
  console.log('🧪 开始测试：闹钟提醒插件完整流程');
  console.log('='.repeat(60));

  try {
    // 步骤1：检查服务器是否运行
    console.log('\n📋 步骤1：检查服务器健康状态');
    await axios.get('http://localhost:3000/health');
    console.log('✅ 服务器正常运行');

    // 步骤2：创建项目
    console.log('\n📋 步骤2：创建测试项目');
    const projectData = {
      name: '闹钟测试项目',
      description: '用于测试闹钟提醒插件'
    };
    const projectResponse = await axios.post(`${API_BASE}/projects`, projectData);
    if (!projectResponse.data.success) {
      throw new Error(`创建项目失败: ${projectResponse.data.error}`);
    }
    const project = projectResponse.data.data;
    console.log(`✅ 项目创建成功，ID: ${project.projectId}, 名称: "${project.name}"`);

    // 步骤3：创建目标
    console.log('\n📋 步骤3：创建测试目标');
    const goalData = {
      name: '完成每周任务',
      description: '提醒我每周完成这个任务'
    };
    const goalResponse = await axios.post(`${API_BASE}/goals/projects/${project.projectId}/goals`, goalData);
    if (!goalResponse.data.success) {
      throw new Error(`创建目标失败: ${goalResponse.data.error}`);
    }
    const goal = goalResponse.data.data;
    console.log(`✅ 目标创建成功，ID: ${goal.goalId}, 名称: "${goal.name}"`);

    // 步骤4：添加闹钟配置
    console.log('\n📋 步骤4：添加闹钟配置');
    const alarmConfig = {
      enabled: true,
      time: '09:00',
      days: [1, 2, 3, 4, 5], // 周一到周五
      message: `提醒：需要完成 "${goal.name}"！`
    };
    const saveResponse = await axios.post(
      `${API_BASE}/goals/${goal.goalId}/alarm`,
      alarmConfig
    );
    if (!saveResponse.data.success) {
      throw new Error(`保存闹钟配置失败: ${saveResponse.data.error}`);
    }
    console.log(`✅ 闹钟配置保存成功`);
    console.log(`   Config: enabled=${alarmConfig.enabled}, time=${alarmConfig.time}, days=[${alarmConfig.days.join(',')}]`);
    console.log(`   Message: ${alarmConfig.message}`);

    // 步骤5：验证闹钟配置
    console.log('\n📋 步骤5：验证闹钟配置是否正确保存');
    const getResponse = await axios.get(`${API_BASE}/goals/${goal.goalId}/alarm`);
    if (!getResponse.data.success) {
      throw new Error(`获取闹钟配置失败: ${getResponse.data.error}`);
    }
    const savedConfig = getResponse.data.data;
    if (savedConfig.enabled !== alarmConfig.enabled) {
      throw new Error(`验证失败：enabled不匹配，预期 ${alarmConfig.enabled}，实际 ${savedConfig.enabled}`);
    }
    if (savedConfig.time !== alarmConfig.time) {
      throw new Error(`验证失败：time不匹配，预期 ${alarmConfig.time}，实际 ${savedConfig.time}`);
    }
    if (JSON.stringify(savedConfig.days.sort()) !== JSON.stringify(alarmConfig.days.sort())) {
      throw new Error(`验证失败：days不匹配，预期 [${alarmConfig.days}]，实际 [${savedConfig.days}]`);
    }
    if (savedConfig.message !== alarmConfig.message) {
      throw new Error(`验证失败：message不匹配，预期 "${alarmConfig.message}"，实际 "${savedConfig.message}"`);
    }
    console.log('✅ 闹钟配置验证成功，保存的数据与输入一致');

    // 步骤6：测试获取待触发闹钟列表
    console.log('\n📋 步骤6：测试获取待触发闹钟列表接口');
    const dueAlarmsResponse = await axios.get(`${API_BASE}/alarm/due`);
    if (!dueAlarmsResponse.data.success) {
      throw new Error(`获取待触发闹钟失败: ${dueAlarmsResponse.data.error}`);
    }
    if (!Array.isArray(dueAlarmsResponse.data.data)) {
      throw new Error('验证失败：返回数据不是数组');
    }
    console.log(`✅ 待触发闹钟接口工作正常`);
    console.log(`   当前找到 ${dueAlarmsResponse.data.data.length} 个待触发闹钟`);

    // 步骤7：测试边界情况 - 获取不存在的闹钟
    console.log('\n📋 步骤7：测试边界情况 - 获取不存在的闹钟配置');
    const nonExistentGoalId = 999999;
    const notFoundResponse = await axios.get(`${API_BASE}/goals/${nonExistentGoalId}/alarm`);
    if (!notFoundResponse.data.success) {
      throw new Error(`验证失败：获取不存在闹钟应该返回 success，但返回错误: ${notFoundResponse.data.error}`);
    }
    if (notFoundResponse.data.data !== null) {
      throw new Error('验证失败：不存在的闹钟应该返回 null');
    }
    console.log('✅ 边界情况验证通过：不存在的闹钟返回 null');

    // 步骤8：测试参数验证 - 无效时间格式
    console.log('\n📋 步骤8：测试参数验证 - 无效时间格式');
    const invalidTimeConfig = {
      enabled: true,
      time: '25:70', // 无效时间
      days: [1, 2, 3],
      message: 'Test invalid time'
    };
    try {
      await axios.post(
        `${API_BASE}/goals/${goal.goalId}/alarm`,
        invalidTimeConfig
      );
      throw new Error('验证失败：无效时间格式应该被拒绝，但请求成功了');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status !== 400 || error.response.data.success !== false) {
          throw new Error(`验证失败：无效时间格式应该返回 400 和 success=false，实际状态码: ${error.response.status}, success: ${error.response.data.success}`);
        }
        console.log(`✅ 参数验证通过：无效时间格式被正确拒绝，状态码: ${error.response.status}`);
      } else {
        throw error;
      }
    }

    // 步骤9：测试参数验证 - 无效星期格式
    console.log('\n📋 步骤9：测试参数验证 - 无效星期格式');
    const invalidDaysConfig = {
      enabled: true,
      time: '10:00',
      days: [0, 1, 7], // 0 和 7 超出范围
      message: 'Test invalid days'
    };
    try {
      await axios.post(
        `${API_BASE}/goals/${goal.goalId}/alarm`,
        invalidDaysConfig
      );
      throw new Error('验证失败：无效星期格式应该被拒绝，但请求成功了');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status !== 400 || error.response.data.success !== false) {
          throw new Error(`验证失败：无效星期格式应该返回 400 和 success=false，实际状态码: ${error.response.status}, success: ${error.response.data.success}`);
        }
        console.log(`✅ 参数验证通过：无效星期格式被正确拒绝，状态码: ${error.response.status}`);
      } else {
        throw error;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 所有测试通过！闹钟提醒插件功能验证成功');
    console.log(`   创建的项目ID: ${project.projectId}`);
    console.log(`   创建的目标ID: ${goal.goalId}`);

  } catch (error) {
    console.error('\n❌ 测试失败');
    if (axios.isAxiosError(error)) {
      console.error('请求信息:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data
      });
    } else {
      console.error('错误信息:', (error as Error).message);
    }
    process.exit(1);
  }
}

// 如果直接运行则执行测试
if (require.main === module) {
  runTest();
}

export default runTest;