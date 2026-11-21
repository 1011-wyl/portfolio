import dayjs from 'dayjs'
import type { TripPlan, KnowledgeGraphData } from '@/types'

const start = dayjs().add(14, 'day').startOf('day')
const places = [
  [ ['鼓浪屿', '漫步岛上老街与海岸，感受万国建筑。', 118.066, 24.445, 120], ['日光岩', '登高俯瞰鹭江与鼓浪屿。', 118.067, 24.444, 60] ],
  [ ['厦门大学', '欣赏校园建筑与南国风景，请提前确认预约。', 118.105, 24.438, 0], ['南普陀寺', '走访千年古刹，沿山道眺望城市。', 118.103, 24.446, 0] ],
  [ ['环岛路', '沿海骑行，体验厦门的海风。', 118.156, 24.433, 0], ['曾厝垵', '在街巷中寻找闽南小吃与伴手礼。', 118.134, 24.433, 0] ],
] as const
export const demoPlan: TripPlan = {
 city: '厦门', cities: ['厦门'], start_date: start.format('YYYY-MM-DD'), end_date: start.add(2, 'day').format('YYYY-MM-DD'),
 days: places.map((items, i) => ({ date: start.add(i, 'day').format('YYYY-MM-DD'), day_index: i, city: '厦门', description: ['海岛风光与历史街巷', '人文古迹与校园漫步', '滨海骑行与闽南美味'][i], transportation: '公共交通 / 步行', accommodation: '舒适型酒店', hotel: { name: '厦门海景酒店（示例）', address: '厦门市思明区', price_range: '¥360/晚', rating: '4.6', distance: '市中心', type: '舒适型酒店', estimated_cost: 360 }, attractions: items.map(([name, description, longitude, latitude, ticket_price]) => ({name, description, address: '厦门市思明区', location: {longitude, latitude}, visit_duration: 120, ticket_price, rating: 4.7})), meals: [{type:'lunch', name: ['沙茶面与海蛎煎', '闽南特色午餐', '海鲜与土笋冻'][i], estimated_cost: 70}, {type:'dinner', name:'闽南风味晚餐', estimated_cost: 90}] })),
 weather_info: places.map((_, i) => ({date:start.add(i,'day').format('YYYY-MM-DD'), city:'厦门', day_weather:['晴','多云','晴'][i], night_weather:'多云', day_temp:26, night_temp:20, wind_direction:'东南风', wind_power:'3级'})),
 overall_suggestions:'示例行程：以公共交通和步行为主，建议提前预约热门景点；天气与价格均为演示数据，出行前请核实。',
 budget:{total_attractions:180,total_hotels:1080,total_meals:480,total_transportation:180,total:1920}
}
export const demoGraph: KnowledgeGraphData = {
 categories: [{name:'城市'}, {name:'景点'}],
 nodes: [{id:'city', name:'厦门', category:0, symbolSize:60}, ...places.flat().map(([name], i) => ({id:`p${i}`, name, category:1, symbolSize:36}))],
 edges: places.flat().map((_, i) => ({source:'city', target:`p${i}`}))
}
export function openDemo() {
 sessionStorage.setItem('tripPlan', JSON.stringify(demoPlan))
 sessionStorage.setItem('graphData', JSON.stringify(demoGraph))
 sessionStorage.removeItem('planId')
}

