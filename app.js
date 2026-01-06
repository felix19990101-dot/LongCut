const SUPADATA_API_KEY = 'API_KEY';
const SUPADATA_API_URL = 'https://api.supadata.ai/v1/transcript';

let currentVideoId = '';
let transcriptData = null;
let player = null;
let chatHistory = [];

// 不同角色的亮点筛选标准
function getRoleInfo(role) {
    const roleStandards = {
        pm: {
            name: '项目经理',
            standards: [
                {
                    type: '项目概述',
                    description: '当讲者介绍项目的目标、范围和预期成果时',
                    keywords: '项目目标, 项目范围, 预期成果, 关键指标, 成功标准, 里程碑, 时间表, 资源需求'
                },
                {
                    type: '关键决策',
                    description: '当团队做出重要技术选型或架构决策时',
                    keywords: '决策, 选择方案, 技术选型, 架构设计, 权衡, 考虑因素, 最终决定, 采用方案'
                },
                {
                    type: '风险管理',
                    description: '当讨论项目风险和应对策略时',
                    keywords: '风险, 潜在问题, 挑战, 应对策略, 备选方案, 风险评估, 缓解措施'
                },
                {
                    type: '进度更新',
                    description: '当汇报项目进展和关键里程碑完成情况时',
                    keywords: '进度, 里程碑, 完成情况, 下一阶段, 状态更新, 已完成, 进行中'
                },
                {
                    type: '资源分配',
                    description: '当讨论团队成员分工和资源分配时',
                    keywords: '分工, 负责, 资源, 团队, 协作, 角色, 任务分配'
                }
            ]
        },
        ai_student: {
            name: 'AI 学生',
            standards: [
                {
                    type: '核心概念',
                    description: '当明确定义一个 AI 技术术语或概念时',
                    keywords: '定义, 概念, 术语, 是什么, 原理, 基础, 核心要点'
                },
                {
                    type: '实践演示',
                    description: '当从理论讲解转向实际代码或模型演示时',
                    keywords: '演示, 实践, 实际操作, 来看代码, 运行, 示例, 实现'
                },
                {
                    type: '算法详解',
                    description: '当深入讲解算法原理、公式推导时',
                    keywords: '算法, 原理, 公式, 推导, 数学, 计算, 步骤'
                },
                {
                    type: '避坑指南',
                    description: '当提到常见错误和注意事项时',
                    keywords: '注意, 错误, 避坑, 常见问题, 不要忘记, 易错点, 务必'
                },
                {
                    type: '工具使用',
                    description: '当介绍开发工具、库或框架时',
                    keywords: '工具, 库, 框架, 安装, 配置, 使用, 教程'
                }
            ]
        },
        developer: {
            name: '开发者',
            standards: [
                {
                    type: '技术方案',
                    description: '当提出具体的实现方案或架构设计时',
                    keywords: '方案, 架构, 设计, 实现, 技术栈, 模式, 原则'
                },
                {
                    type: '代码示例',
                    description: '当展示具体代码或配置示例时',
                    keywords: '代码, 示例, 配置, 写法, 语法, 函数, 类, 方法'
                },
                {
                    type: '问题解决',
                    description: '当讲解 Bug 修复或技术问题解决方案时',
                    keywords: '修复, 解决, 问题, 调试, 错误, 异常, 处理'
                },
                {
                    type: '性能优化',
                    description: '当讨论性能改进或优化技巧时',
                    keywords: '优化, 性能, 加速, 效率, 缓存, 延迟, 吞吐量'
                },
                {
                    type: '最佳实践',
                    description: '当分享代码规范和开发最佳实践时',
                    keywords: '最佳实践, 规范, 约定, 风格, 模式, 设计原则'
                }
            ]
        },
        designer: {
            name: '设计师',
            standards: [
                {
                    type: '设计理念',
                    description: '当阐述设计原则、视觉风格理念时',
                    keywords: '理念, 原则, 风格, 视觉, 美学, 用户体验, 设计思维'
                },
                {
                    type: '工具演示',
                    description: '当展示设计工具操作和功能时',
                    keywords: '工具, 软件, 操作, 功能, 快捷键, 技巧, 效率'
                },
                {
                    type: '案例分析',
                    description: '当分析成功设计案例或作品时',
                    keywords: '案例, 作品, 分析, 成功, 参考, 灵感, 灵感来源'
                },
                {
                    type: '配色技巧',
                    description: '当讲解色彩搭配和配色方案时',
                    keywords: '配色, 色彩, 颜色, 调色, 搭配, 色调, 对比度'
                },
                {
                    type: '排版布局',
                    description: '当讨论字体、排版和布局技巧时',
                    keywords: '排版, 字体, 布局, 间距, 对齐, 层级, 视觉流'
                }
            ]
        },
        business: {
            name: '商业分析师',
            standards: [
                {
                    type: '市场分析',
                    description: '当分析市场趋势、竞争格局时',
                    keywords: '市场, 趋势, 竞争, 分析, 数据, 统计, 增长'
                },
                {
                    type: '商业模式',
                    description: '当讲解盈利模式、商业策略时',
                    keywords: '商业模式, 盈利, 策略, 收入, 成本, 规模, 扩展'
                },
                {
                    type: '客户洞察',
                    description: '当分析用户需求、客户痛点时',
                    keywords: '用户, 需求, 痛点, 洞察, 反馈, 行为, 习惯'
                },
                {
                    type: '数据指标',
                    description: '当讨论 KPI、数据监控指标时',
                    keywords: 'KPI, 指标, 数据, 监控, 转化, 留存, 增长'
                },
                {
                    type: '决策建议',
                    description: '当给出战略建议或行动方案时',
                    keywords: '建议, 决策, 行动, 战略, 方向, 优先级, 计划'
                }
            ]
        },
        general: {
            name: '普通观众',
            standards: [
                {
                    type: '核心观点',
                    description: '当讲者表达主要观点和核心思想时',
                    keywords: '观点, 认为, 想, 主要, 核心, 关键, 重点, 总结'
                },
                {
                    type: '精彩瞬间',
                    description: '当视频出现有趣或震撼的内容时',
                    keywords: '精彩, 震撼, 有趣, 好玩, 创意, 亮点'
                },
                {
                    type: '实用技巧',
                    description: '当分享实用技能或小技巧时',
                    keywords: '技巧, 技能, 小技巧, 方法, 窍门, 实用, 效率'
                },
                {
                    type: '情感共鸣',
                    description: '当内容引发情感共鸣或启发时',
                    keywords: '启发, 感悟, 经验, 故事, 分享, 心得'
                },
                {
                    type: '总结回顾',
                    description: '当讲者进行总结或回顾要点时',
                    keywords: '总结, 回顾, 要点, 重点, 再次, 总之, 所以'
                }
            ]
        }
    };

    return roleStandards[role] || roleStandards.general;
}

// 加载 YouTube IFrame Player API
function loadYouTubeAPI() {
    console.log('开始加载 YouTube API...');

    // 检查 API 是否已加载
    if (window.YT && window.YT.Player) {
        console.log('YouTube API 已存在');
        return;
    }

    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    console.log('YouTube API 脚本已插入');
}

// YouTube API 就绪回调
window.onYouTubeIframeAPIReady = function() {
    console.log('✅ YouTube API 已成功加载');
    console.log('YT 对象:', typeof YT, YT ? '已初始化' : '未初始化');
};

// 创建 YouTube 播放器
function createPlayer(videoId) {
    // 移除旧的 iframe
    const container = document.querySelector('.video-player');
    container.innerHTML = '<div id="player"></div>';

    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'playsinline': 1,
            'autoplay': 1,
            'rel': 0,
            'modestbranding': 1,
            'controls': 1,
            'enablejsapi': 1,
            'origin': window.location.origin || 'http://localhost:8000'
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerReady(event) {
    console.log('播放器已就绪');
    // 自动播放
    event.target.playVideo();
}

function onPlayerStateChange(event) {
    console.log('播放器状态变化:', event.data);
    // 状态值：-1=未开始, 0=已结束, 1=播放中, 2=已暂停, 3=缓冲中, 5=已插入
}

function onPlayerError(event) {
    console.error('播放器错误:', event.data);
    let errorMsg = '';
    switch(event.data) {
        case 2:
            errorMsg = '视频参数无效';
            break;
        case 5:
            errorMsg = 'HTML5 播放器错误';
            break;
        case 100:
            errorMsg = '视频未找到或已被删除';
            break;
        case 101:
        case 150:
            errorMsg = '该视频不允许嵌入播放';
            break;
        default:
            errorMsg = '播放器发生错误 (错误代码: ' + event.data + ')';
    }

    // 显示错误信息并提供手动播放按钮
    showError(`视频播放失败: ${errorMsg}`);

    // 如果视频不允许嵌入，尝试使用新窗口打开
    if (event.data === 101 || event.data === 150) {
        const playButton = document.getElementById('playButton');
        if (playButton) {
            playButton.style.display = 'block';
            playButton.innerHTML = `
                <p style="margin-bottom: 15px; color: #666;">该视频不允许嵌入，请点击下方按钮在新窗口播放</p>
                <button onclick="openVideoInNewTab()" style="padding: 15px 30px; font-size: 16px; cursor: pointer; background: #667eea; color: white; border: none; border-radius: 8px;">
                    🎬 在新窗口中播放
                </button>
            `;
        }
    }
}

// 手动播放视频
function manuallyPlayVideo() {
    if (player && player.playVideo) {
        player.playVideo();
    }
}

// 在新标签页打开视频
function openVideoInNewTab() {
    if (currentVideoId) {
        window.open(`https://www.youtube.com/watch?v=${currentVideoId}`, '_blank');
    }
}

// 从 YouTube URL 提取 video_id
function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }

    return null;
}

// 格式化时间为 HH:MM:SS 或 MM:SS
function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// 解析时间字符串为毫秒 (支持 HH:MM:SS, MM:SS, 或直接秒数)
function parseTimeToMilliseconds(timeValue) {
    // 如果是数字，直接返回毫秒
    if (typeof timeValue === 'number') {
        return timeValue;
    }

    // 如果是字符串，尝试解析
    if (typeof timeValue === 'string') {
        // 移除所有空格
        timeValue = timeValue.trim();

        // 如果已经是纯数字（可能是秒数），转换为毫秒
        if (/^\d+$/.test(timeValue)) {
            return parseInt(timeValue) * 1000;
        }

        // 解析 HH:MM:SS 格式
        const parts = timeValue.split(':');
        if (parts.length === 3) {
            const [hours, minutes, seconds] = parts.map(Number);
            return (hours * 3600 + minutes * 60 + seconds) * 1000;
        }

        // 解析 MM:SS 格式
        if (parts.length === 2) {
            const [minutes, seconds] = parts.map(Number);
            return (minutes * 60 + seconds) * 1000;
        }
    }

    // 无法解析，返回 0
    console.warn('无法解析时间:', timeValue);
    return 0;
}

// 显示错误信息
function showError(message) {
    const errorEl = document.getElementById('errorMessage');
    errorEl.textContent = message;
    errorEl.classList.add('active');
}

// 清除错误信息
function clearError() {
    const errorEl = document.getElementById('errorMessage');
    errorEl.textContent = '';
    errorEl.classList.remove('active');
}

// 更新加载状态
function updateLoadingStatus(status) {
    document.getElementById('statusText').textContent = status;
}

// 获取视频字幕
async function fetchTranscript(url) {
    updateLoadingStatus('正在获取视频字幕...');
    
    try {
        const response = await fetch(
            `${SUPADATA_API_URL}?url=${encodeURIComponent(url)}`,
            {
                headers: {
                    'x-api-key': SUPADATA_API_KEY
                }
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP 错误: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('获取字幕失败:', error);
        throw new Error(`获取字幕失败: ${error.message}`);
    }
}

// 使用 Gemini 分析字幕
async function analyzeWithGemini(transcript, apiKey) {
    updateLoadingStatus('正在使用 AI 分析视频内容...');

    // 获取字幕总时长
    const totalDuration = Math.max(...transcript.content.map(s => s.offset + s.duration));
    const totalMinutes = Math.floor(totalDuration / 60000);
    const totalSeconds = Math.floor(totalDuration / 1000);

    // 获取用户选择的角色
    const userRole = document.getElementById('userRole').value;
    const roleInfo = getRoleInfo(userRole);

    // 分段采样字幕内容：开头、中间、结尾各一段
    const segmentCount = 5;
    const segments = [];
    const segmentDuration = Math.floor(transcript.content.length / segmentCount);

    for (let i = 0; i < segmentCount; i++) {
        const startIdx = i * segmentDuration;
        const endIdx = Math.min((i + 1) * segmentDuration, transcript.content.length);
        const segmentContent = transcript.content.slice(startIdx, endIdx)
            .slice(0, 20) // 每段取前20条
            .map(item => `[${formatTime(item.offset)}] ${item.text}`)
            .join('\n');
        segments.push(`【视频第 ${Math.floor(i * 20)}-${Math.floor((i + 1) * 20)}% 部分内容】\n${segmentContent}`);
    }

    const transcriptSample = segments.join('\n\n---\n\n');

    const prompt = `请分析以下视频字幕，返回 JSON 格式结果。

视频总时长：${totalMinutes}分${totalSeconds % 60}秒（${formatTime(totalDuration)}）

目标用户身份：${roleInfo.name}

字幕内容（分段采样，覆盖整个视频）：
${transcriptSample}

亮点选取标准（严格按照以下${roleInfo.standards.length}类筛选）：

${roleInfo.standards.map((std, idx) => `${idx + 1}. **${std.type}**：${std.description}\n   - 关键词：${std.keywords}`).join('\n\n')}

过滤逻辑：
- 排除冗长的开场白和结束语
- 排除无实际信息含量的互动（如"大家听得到吗"）
- 优先选择符合${roleInfo.name}关注点的实质内容

要求：
1. 自主决定生成 5-8 个关键亮点（根据视频内容和长度智能判断数量）

2. 返回的是"视频进度百分比"（不是具体时间），范围 0-100：
   - percentage: 视频进度百分比（整数，例如：15 表示视频15%位置）
   - description: 简短描述（10-20字）
   - type: 亮点类型（从以上标准中选择）

3. 亮点必须均匀分布在整个视频：
   - 必须从 10% 开始到 90% 结束之间分布
   - 每个亮点之间至少间隔 10%
   - 示例：15, 25, 40, 55, 70, 85, 95（7个亮点）
   - 确保覆盖视频的开始、中间、和结束部分

4. 根据上述${roleInfo.standards.length}类标准选择，不要选择不符合标准的节点

返回格式（纯JSON，不要其他文字，不要代码块标记）：
{
  "percentageHighlights": [
    {
      "percentage": 15,
      "description": "描述文字",
      "type": "核心定义点"
    }
  ]
}`;

    // 支持多个模型，按优先级尝试

    // 支持多个模型，按优先级尝试
    const models = [
        'gemini-1.5-pro-latest',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-2.0-flash-exp'
    ];

    for (const model of models) {
        try {
            console.log(`尝试使用模型: ${model}`);

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: prompt
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            topK: 40,
                            topP: 0.95,
                            maxOutputTokens: 2048
                        }
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error(`模型 ${model} 错误:`, errorData);
                continue; // 尝试下一个模型
            }

            const data = await response.json();
            const text = data.candidates[0].content.parts[0].text;

            console.log('AI 返回的原始文本:', text);

            // 提取 JSON
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('无法从 AI 响应中提取 JSON');
            }

            let result = JSON.parse(jsonMatch[0]);
            console.log('解析后的百分比结果:', result);

            // 验证数据结构
            if (!result.percentageHighlights || !Array.isArray(result.percentageHighlights)) {
                throw new Error('AI 返回的数据结构不正确：缺少 percentageHighlights 数组');
            }

            // 将百分比转换为具体的时间戳
            const highlights = result.percentageHighlights.map(item => {
                const time = Math.floor((item.percentage / 100) * totalDuration);

                // 找到最近的字幕段
                let closestSegment = null;
                let minDiff = Infinity;
                for (const segment of transcript.content) {
                    const diff = Math.abs(segment.offset - time);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestSegment = segment;
                    }
                }

                return {
                    time: closestSegment ? closestSegment.offset : time,
                    formatted: formatTime(closestSegment ? closestSegment.offset : time),
                    description: item.description,
                    type: item.type || '关键节点'
                };
            });

            console.log(`模型 ${model} 成功，转换为具体时间戳:`, highlights);

            return {
                highlights: highlights,
                quotes: []
            };
        } catch (error) {
            console.error(`模型 ${model} 失败:`, error);
            if (model === models[models.length - 1]) {
                // 最后一个模型也失败了
                throw error;
            }
            // 继续尝试下一个模型
        }
    }
}

// 使用规则引擎生成亮点（当没有 Gemini API Key 时）
function generateHighlightsRules(transcript) {
    const highlights = [];

    // 收集所有文本段
    const segments = transcript.content;

    // 计算总时长
    const totalDuration = Math.max(...segments.map(s => s.offset + s.duration));

    // 根据视频长度生成不同数量的亮点，覆盖整个视频
    let highlightCount;
    const totalMinutes = totalDuration / 60000; // 转换为分钟

    if (totalMinutes < 3) {
        highlightCount = 3; // 短视频：3个
    } else if (totalMinutes < 10) {
        highlightCount = 5; // 中等视频：5个
    } else if (totalMinutes < 30) {
        highlightCount = 8; // 长视频：8个
    } else {
        highlightCount = 10; // 超长视频：10个
    }

    console.log(`视频时长: ${formatTime(totalDuration)}，生成 ${highlightCount} 个亮点`);

    // 生成亮点 - 均匀分布覆盖整个视频
    // 关键修复：使用 (i + 1) 确保从第一个位置到最后一个位置分布
    for (let i = 0; i < highlightCount; i++) {
        // 均匀分布：从 0 到 100%
        const percentage = (i + 1) / (highlightCount + 1);
        const position = Math.floor(percentage * totalDuration);

        console.log(`亮点 ${i + 1}: 百分比 ${(percentage * 100).toFixed(1)}%, 位置 ${formatTime(position)}`);

        // 找到最近的文本段
        let closestSegment = null;
        let minDiff = Infinity;

        for (const segment of segments) {
            const diff = Math.abs(segment.offset - position);
            if (diff < minDiff && segment.text.length > 5) {
                minDiff = diff;
                closestSegment = segment;
            }
        }

        if (closestSegment && closestSegment.text.length > 5) {
            highlights.push({
                time: closestSegment.offset,
                formatted: formatTime(closestSegment.offset),
                description: closestSegment.text.substring(0, 30) + (closestSegment.text.length > 30 ? '...' : '')
            });
        }
    }

    console.log('生成的亮点位置:', highlights.map(h => h.formatted));

    return { highlights, quotes: [] }; // 不再返回 quotes
}

// 显示分析结果
function displayResults(videoId, analysis) {
    console.log('正在创建播放器，视频ID:', videoId);

    // 创建 YouTube 播放器
    if (player && player.loadVideoById && typeof player.loadVideoById === 'function') {
        console.log('使用现有播放器加载视频');
        player.loadVideoById(videoId);
    } else {
        console.log('创建新播放器');
        createPlayer(videoId);
    }

    // 显示亮点
    const highlightsList = document.getElementById('highlightsList');
    highlightsList.innerHTML = '';

    if (analysis.highlights.length === 0) {
        highlightsList.innerHTML = '<p style="color: #999;">未找到亮点</p>';
    } else {
        analysis.highlights.forEach((highlight, index) => {
            const item = document.createElement('div');
            item.className = 'highlight-item';
            item.setAttribute('data-type', highlight.type || '关键节点');
            item.innerHTML = `
                <div class="highlight-time">${highlight.formatted}</div>
                <div class="highlight-desc">${highlight.description}</div>
                <div class="highlight-type">${highlight.type || '关键节点'}</div>
            `;
            item.onclick = () => jumpToTime(highlight.time);
            highlightsList.appendChild(item);
        });
    }

    // 显示结果区域
    document.getElementById('results').classList.add('active');
}

// 跳转到指定时间
function jumpToTime(time) {
    console.log('========== 跳转时间 ==========');
    console.log('输入时间 (毫秒):', time);
    console.log('输入时间 (秒):', time / 1000);
    console.log('输入时间 (格式化):', formatTime(time));
    console.log('===========================');

    if (player && player.seekTo && typeof player.seekTo === 'function') {
        const seconds = time / 1000;

        console.log('✓ 播放器可用');
        console.log('✓ 调用 seekTo，目标秒数:', seconds);

        player.seekTo(seconds, true);

        // 等待跳转完成后播放
        setTimeout(() => {
            if (player && player.playVideo) {
                console.log('✓ 开始播放');
                player.playVideo();

                // 再次验证跳转位置
                setTimeout(() => {
                    const currentTime = player.getCurrentTime ? player.getCurrentTime() : null;
                    console.log('当前播放位置:', currentTime, '秒');
                }, 500);
            }
        }, 200);
    } else {
        console.error('✗ 播放器未初始化或方法不可用');
        console.log('player 对象:', player);
        showError('播放器未就绪，请稍后重试');
    }
}

// 主分析函数
async function analyzeVideo() {
    clearError();

    const url = document.getElementById('videoUrl').value.trim();
    const geminiKey = document.getElementById('geminiKey').value.trim();

    if (!url) {
        showError('请输入 YouTube 视频链接');
        return;
    }

    currentVideoId = extractVideoId(url);
    if (!currentVideoId) {
        showError('无效的 YouTube 链接');
        return;
    }

    console.log('开始分析视频:', currentVideoId);

    // 显示加载状态
    document.getElementById('loading').classList.add('active');
    document.getElementById('results').classList.remove('active');
    document.getElementById('analyzeBtn').disabled = true;

    // 隐藏手动播放按钮
    document.getElementById('playButton').style.display = 'none';

    try {
        // 获取字幕
        transcriptData = await fetchTranscript(url);

        if (!transcriptData.content || transcriptData.content.length === 0) {
            throw new Error('该视频没有字幕或字幕提取失败');
        }

        // 分析字幕
        let analysis;
        if (geminiKey) {
            analysis = await analyzeWithGemini(transcriptData, geminiKey);
        } else {
            updateLoadingStatus('正在使用规则引擎分析...');
            await new Promise(resolve => setTimeout(resolve, 500)); // 模拟处理
            analysis = generateHighlightsRules(transcriptData);
        }

        // 显示结果
        displayResults(currentVideoId, analysis);

    } catch (error) {
        showError(error.message);
        console.error('分析失败:', error);
    } finally {
        document.getElementById('loading').classList.remove('active');
        document.getElementById('analyzeBtn').disabled = false;
    }
}

// 页面加载时的初始化
document.addEventListener('DOMContentLoaded', () => {
    // 加载 YouTube API
    loadYouTubeAPI();

    const videoUrlInput = document.getElementById('videoUrl');
    videoUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            analyzeVideo();
        }
    });
});
