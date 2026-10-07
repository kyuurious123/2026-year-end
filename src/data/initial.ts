import { DEFAULTS } from '../design'
import type { MiddleAlign, MonthData, QuarterData } from '../types'

// 더미 텍스트: 길이가 다른 세 가지를 달마다 돌려 씁니다.
const DUMMY_BODIES = [
  `만화 『명탐정 코난』의 에피소드 중 하나. 단행본 59권에 수록. 애니메이션판에서는 2008년 11월 3일·10일에 전편(제516화, 1시간 스페셜 「풍림화산 미궁의 갑옷 무사」)과 후편(제517화 「풍림화산 음과 뇌광의 결착」)으로 방송되었다.
나가노 현경의 야마토 칸스케, 우에하라 유이는 이 에피소드에서 첫 등장.
줄거리
기괴한 연쇄 변사 사건의 조사를 의뢰받고 나가노현의 작은 마을로 향한 코고로를 따라간 코난과 란. 같은 의뢰를 받고 오사카에서 온 헤이지·카즈하와 합류하지만, 그곳에서 연쇄 살인이 발생한다.`,

  `10개월 전, 야츠가타케 연봉의 미호다케에서 나가노 현경의 야마토 간스케는 8년 전 총포상 강도 상해 사건의 피의자로 가석방 중 행방이 묘연해진 미쿠리야 사다쿠니를 추적하던 중, 미쿠리야와는 별개의 누군가의 모습을 목격한다. 간스케는 그 인물에게 라이플로 발포당해 왼쪽 눈에 부상을 입고, 직후 눈사태에 휘말리게 된다. 칸스케는 기적적으로 구조되었으나, 산중에서의 기억을 잃고 말았다.
그로부터 10개월 후, 나가노 현의 국립천문대 노베야마에서, 시설에 침입한 누군가가 직원 엔노이 마도카를 공격하는 사건이 발생한다. 간스케는 동료인 우에하라 유이와 함께 현장에 출동하지만, 천문대의 파라볼라 안테나를 보자마자 왼쪽 눈 부위가 쑤시며 고통을 느낀다.`,

  `죽음의 저택, 붉은 벽 [삼고초려 / 손바닥 안의 것 / 죽은 공명 / 공성계]
나가노 현경 야마토 칸스케 경부의 요청으로 사건 수사에 협력하기 위해 나가노를 찾은 코고로 일행. 숲속에 세워진 '희망의 저택'이라는 이름의 낡은 저택에서, 한 남성이 방 안에 갇힌 채 굶어 죽게 된 살인 사건이 일어났다. 피해자가 다잉 메시지를 남겼지만 도무지 풀리지 않아 곤란한 상황이라는 것이다. 그 다잉 메시지란, 방의 벽 한 면만을 래커 스프레이로 붉게 칠하고, 흰색과 검은색으로 나누어 칠한 두 개의 의자를 등을 맞대게 놓은 뒤, 그 흰색 쪽 의자에 시신이 앉아 있었다는 것… 과연 이 메시지에 담긴 진의는!? 코난과 야마토 칸스케 경부 외에 관할서의 모로후시 타카아키 경부도 수사에 합류해, 세 사람이 힘을 합쳐 난공불락의 '붉은 벽' 사건의 수수께끼에 도전한다!!`,
]

const DUMMY_TITLES = ['풍림화산', '명탐정 코난', '죽음의 저택, 붉은 벽']
const DUMMY_SUBTITLES = ['야마토 칸스케, 우에하라 유이', '척안의 잔상', '모로후시 타카아키, 우에하라 유이, 야마토 칸스케']

function createMonth(monthIndex: number): MonthData {
  const slot = monthIndex % 3
  const dummy = (monthIndex + Math.floor(monthIndex / 3)) % 3
  return {
    body: DUMMY_BODIES[dummy],
    title: DUMMY_TITLES[dummy],
    subtitle: DUMMY_SUBTITLES[dummy],
    bodyWidth: slot === 1 ? DEFAULTS.bodyWidthRight : DEFAULTS.bodyWidthLeft,
    image: null,
  }
}

// 네 장이 같은 모양으로 반복되지 않게 기본 정렬을 번갈아 둡니다.
const DEFAULT_ALIGNS: MiddleAlign[] = ['top', 'bottom', 'top', 'bottom']

export function createInitialQuarters(): QuarterData[] {
  return DEFAULT_ALIGNS.map((middleAlign, q) => ({
    middleAlign,
    months: [createMonth(q * 3), createMonth(q * 3 + 1), createMonth(q * 3 + 2)],
  }))
}
