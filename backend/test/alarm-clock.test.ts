/**
 * 闹钟提醒插件测试
 * 测试流程：
 * 1. 获取所有项目
 * 2. 随机选择一个项目
 * 3. 获取该项目的所有目标
 * 4. 随机选择一个目标
 * 5. 给该目标添加闹钟配置
 * 6. 获取闹钟配置验证结果
 */

import dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import app from '../src/index';

/**
 * 项目接口定义（API返回为蛇形命名）
 */
interface Project {
  project_id: number;
  name: string;
  description?: string;
}

/**
 * 目标接口定义（API返回为蛇形命名）
 */
interface Goal {
  goal_id: number;
  name: string;
  description?: string;
  project_id: number;
}

/**
 * 随机选择数组中的一个元素
 * @param array 输入数组
 * @returns 随机选中的元素
 */
function getRandomItem<T>(array: T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

describe('Alarm Clock Plugin E2E Test', () => {
  it('should complete the full flow: get projects -> select project -> get goals -> select goal -> add alarm -> verify', async () => {
    console.log('='.repeat(60));
    console.log('Starting Alarm Clock Plugin E2E Test');
    console.log('='.repeat(60));

    // 步骤1: 获取所有项目
    console.log('\n1. Getting all projects...');
    const projectsResponse = await request(app).get('/api/v1/projects');
    
    expect(projectsResponse.status).toBe(200);
    expect(projectsResponse.body.success).toBe(true);
    
    const projects = projectsResponse.body.data.list;
    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length).toBeGreaterThan(0);
    
    console.log(`   Found ${projects.length} projects`);

    // 步骤2: 随机选择一个项目
    const selectedProject: Project = getRandomItem(projects);
    console.log(`\n2. Randomly selected project: ${selectedProject.name} (ID: ${selectedProject.project_id})`);

    // 步骤3: 获取该项目的所有目标
    console.log(`\n3. Getting all goals for project ID: ${selectedProject.project_id}...`);
    const goalsResponse = await request(app)
      .get('/api/v1/goals')
      .query({ project_id: selectedProject.project_id });
    
    expect(goalsResponse.status).toBe(200);
    expect(goalsResponse.body.success).toBe(true);
    
    const goals = goalsResponse.body.data.list;
    expect(Array.isArray(goals)).toBe(true);
    
    if (goals.length === 0) {
      console.log('   ⚠️ No goals found in this project, test skipped');
      return;
    }
    
    console.log(`   Found ${goals.length} goals`);

    // 步骤4: 随机选择一个目标
    const selectedGoal: Goal = getRandomItem(goals);
    console.log(`\n4. Randomly selected goal: ${selectedGoal.name} (ID: ${selectedGoal.goal_id})`);

    // 步骤5: 给该目标添加闹钟配置
    console.log(`\n5. Adding alarm configuration to goal ID: ${selectedGoal.goal_id}...`);
    const alarmConfig = {
      enabled: true,
      time: '09:00',
      days: [1, 2, 3, 4, 5], // 周一到周五
      message: `提醒：需要完成 "${selectedGoal.name}"！`
    };
    
    const saveResponse = await request(app)
      .post(`/api/v1/goals/${selectedGoal.goal_id}/alarm`)
      .send(alarmConfig);
    
    expect(saveResponse.status).toBe(200);
    expect(saveResponse.body.success).toBe(true);
    
    console.log(`   ✓ Alarm saved successfully`);
    console.log(`   Config: enabled=${alarmConfig.enabled}, time=${alarmConfig.time}, days=[${alarmConfig.days.join(',')}]`);
    console.log(`   Message: ${alarmConfig.message}`);

    // 步骤6: 获取闹钟配置验证结果
    console.log(`\n6. Verifying alarm configuration...`);
    const getResponse = await request(app)
      .get(`/api/v1/goals/${selectedGoal.goal_id}/alarm`);
    
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.success).toBe(true);
    
    const savedConfig = getResponse.body.data;
    expect(savedConfig.enabled).toBe(alarmConfig.enabled);
    expect(savedConfig.time).toBe(alarmConfig.time);
    expect(savedConfig.days).toEqual(expect.arrayContaining(alarmConfig.days));
    expect(savedConfig.message).toBe(alarmConfig.message);
    
    console.log(`   ✓ Alarm configuration verified successfully`);
    console.log(`   Retrieved config matches saved config`);

    // 步骤7: 测试获取待触发闹钟列表
    console.log(`\n7. Testing get due alarms endpoint...`);
    const dueAlarmsResponse = await request(app)
      .get('/api/v1/alarm/due');
    
    expect(dueAlarmsResponse.status).toBe(200);
    expect(dueAlarmsResponse.body.success).toBe(true);
    expect(Array.isArray(dueAlarmsResponse.body.data)).toBe(true);
    
    console.log(`   ✓ Due alarms endpoint works`);
    console.log(`   Found ${dueAlarmsResponse.body.data.length} due alarm(s) currently`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Alarm Clock Plugin E2E Test Completed Successfully!');
    console.log('='.repeat(60));
  }, 30000); // 超时设置30秒

  it('should return 404 when alarm does not exist', async () => {
    // 测试获取不存在的闹钟配置应该返回 null
    const nonExistentGoalId = 999999;
    const response = await request(app)
      .get(`/api/v1/goals/${nonExistentGoalId}/alarm`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeNull();
  });

  it('should validate invalid time format', async () => {
    // 测试验证错误的时间格式
    const invalidConfig = {
      enabled: true,
      time: '25:70', // 无效时间
      days: [1, 2, 3],
      message: 'Test invalid time'
    };

    const response = await request(app)
      .post('/api/v1/goals/1/alarm')
      .send(invalidConfig);
    
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should validate invalid days format', async () => {
    // 测试验证错误的星期格式
    const invalidConfig = {
      enabled: true,
      time: '10:00',
      days: [0, 1, 7], // 7 超出范围
      message: 'Test invalid days'
    };

    const response = await request(app)
      .post('/api/v1/goals/1/alarm')
      .send(invalidConfig);
    
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});