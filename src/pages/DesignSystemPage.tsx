import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Badge,
  Card,
  Chip,
  DistributionBar,
  FilterRow,
  MetricCard,
  PillTabs,
  SearchInput,
  SegmentedControl,
  StatusDot,
  Table,
  Td,
  Th,
  Toggle,
  Tr,
} from '../components/ds'
import type { Tone } from '../components/ds'

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold tracking-[-0.01em] text-strong">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

function SubHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[13px] font-semibold tracking-[0.02em] text-muted uppercase">
      {children}
    </h3>
  )
}

function ColorSwatch({ name, varName, hex }: { name: string; varName: string; hex: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-10 w-10 shrink-0 rounded-md border border-border"
        style={{ background: `var(${varName})` }}
      />
      <div className="min-w-0">
        <div className="text-sm font-medium text-strong">{name}</div>
        <div className="truncate text-xs text-muted">
          {varName} · {hex}
        </div>
      </div>
    </div>
  )
}

const COLOR_GROUPS: { title: string; colors: { name: string; varName: string; hex: string }[] }[] = [
  {
    title: 'Background',
    colors: [
      { name: 'canvas', varName: '--color-canvas', hex: '#F2F4F6' },
      { name: 'surface', varName: '--color-surface', hex: '#FFFFFF' },
      { name: 'surface-subtle', varName: '--color-surface-subtle', hex: '#F9FAFB' },
      { name: 'surface-muted', varName: '--color-surface-muted', hex: '#F2F4F6' },
      { name: 'surface-danger-subtle', varName: '--color-surface-danger-subtle', hex: '#FEF7F7' },
    ],
  },
  {
    title: 'Border',
    colors: [
      { name: 'border', varName: '--color-border', hex: '#E5E8EB' },
      { name: 'border-subtle', varName: '--color-border-subtle', hex: '#EBEEF0' },
      { name: 'border-danger-subtle', varName: '--color-border-danger-subtle', hex: '#F5E4E6' },
    ],
  },
  {
    title: 'Text',
    colors: [
      { name: 'strong', varName: '--color-strong', hex: '#191F28' },
      { name: 'body', varName: '--color-body', hex: '#333D4B' },
      { name: 'secondary', varName: '--color-secondary', hex: '#4E5968' },
      { name: 'muted', varName: '--color-muted', hex: '#8B95A1' },
      { name: 'faint', varName: '--color-faint', hex: '#B0B8C1' },
    ],
  },
  {
    title: 'Brand',
    colors: [
      { name: 'primary', varName: '--color-primary', hex: '#3182F6' },
      { name: 'primary-hover', varName: '--color-primary-hover', hex: '#1B64DA' },
      { name: 'primary-bg', varName: '--color-primary-bg', hex: '#E8F3FF' },
      { name: 'primary-bg-strong', varName: '--color-primary-bg-strong', hex: '#C9DEFA' },
    ],
  },
  {
    title: 'Verdict (고정 — 다른 용도 재사용 금지)',
    colors: [
      { name: 'allow', varName: '--color-allow', hex: '#15C39A' },
      { name: 'allow-text', varName: '--color-allow-text', hex: '#0FA98F' },
      { name: 'allow-bg', varName: '--color-allow-bg', hex: '#E7F8F4' },
      { name: 'transform', varName: '--color-transform', hex: '#FFA92B' },
      { name: 'transform-text', varName: '--color-transform-text', hex: '#C57D00' },
      { name: 'transform-bg', varName: '--color-transform-bg', hex: '#FFF4E0' },
      { name: 'block', varName: '--color-block', hex: '#F04452' },
      { name: 'block-text', varName: '--color-block-text', hex: '#E02B3A' },
      { name: 'block-bg', varName: '--color-block-bg', hex: '#FEECEE' },
    ],
  },
]

const RADIUS_TOKENS = [
  { name: 'radius-xs', px: 8 },
  { name: 'radius-sm', px: 10 },
  { name: 'radius-md', px: 12 },
  { name: 'radius-lg', px: 16 },
  { name: 'radius-xl', px: 20 },
]

const NAV = [
  { id: 'foundations', label: 'Foundations' },
  { id: 'atoms', label: 'Atoms' },
  { id: 'molecules', label: 'Molecules' },
  { id: 'organisms', label: 'Organisms' },
]

export function DesignSystemPage() {
  const [toggleA, setToggleA] = useState(true)
  const [toggleB, setToggleB] = useState(false)
  const [period, setPeriod] = useState<'15m' | '1h' | '6h'>('1h')
  const [tab, setTab] = useState<'overview' | 'events'>('overview')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ allow: true, transform: true, block: false })

  return (
    <div className="min-h-screen bg-canvas">
      <header className="flex h-16 items-center gap-4 bg-surface px-7">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold text-secondary hover:text-strong"
        >
          ← 대시보드
        </Link>
        <div className="text-[17px] font-bold tracking-[-0.02em] text-strong">
          디자인 시스템
        </div>
        <div className="flex-1" />
        <nav className="flex items-center gap-4 text-sm font-medium text-muted">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} className="hover:text-strong">
              {n.label}
            </a>
          ))}
        </nav>
      </header>

      <div className="mx-auto flex max-w-[1100px] flex-col gap-14 px-7 py-10">
        <Section
          id="foundations"
          title="Foundations"
          description="컬러 토큰 · 타이포그래피 스케일 · 라운드 스케일. Pretendard Variable 고정."
        >
          <SubHeading>Colors</SubHeading>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {COLOR_GROUPS.map((group) => (
              <Card key={group.title} padding="md">
                <div className="mb-3 text-[13px] font-semibold text-muted">{group.title}</div>
                <div className="flex flex-col gap-3">
                  {group.colors.map((c) => (
                    <ColorSwatch key={c.varName} {...c} />
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <SubHeading>Typography</SubHeading>
          <Card padding="md">
            <div className="flex flex-col divide-y divide-border-subtle">
              <div className="flex items-baseline gap-4 py-3">
                <span className="w-40 shrink-0 text-xs text-muted">
                  metric-lg · 34/700/-0.03em
                </span>
                <span className="text-[34px] font-bold tracking-[-0.03em] text-strong">
                  11,757
                </span>
              </div>
              <div className="flex items-baseline gap-4 py-3">
                <span className="w-40 shrink-0 text-xs text-muted">
                  metric-md · 26/700/-0.02em
                </span>
                <span className="text-[26px] font-bold tracking-[-0.02em] text-strong">
                  6,940
                </span>
              </div>
              <div className="flex items-baseline gap-4 py-3">
                <span className="w-40 shrink-0 text-xs text-muted">title · 16/700/-0.01em</span>
                <span className="text-base font-bold tracking-[-0.01em] text-strong">
                  시간대별 판정 추이
                </span>
              </div>
              <div className="flex items-baseline gap-4 py-3">
                <span className="w-40 shrink-0 text-xs text-muted">body · 14/500</span>
                <span className="text-sm font-medium text-body">최근 1시간 · 방향 전체</span>
              </div>
              <div className="flex items-baseline gap-4 py-3">
                <span className="w-40 shrink-0 text-xs text-muted">label · 13/600</span>
                <span className="text-[13px] font-semibold text-muted">총 판정 수</span>
              </div>
              <div className="flex items-baseline gap-4 py-3">
                <span className="w-40 shrink-0 text-xs text-muted">caption · 12/500</span>
                <span className="text-xs font-medium text-faint">14:26:02</span>
              </div>
            </div>
          </Card>

          <SubHeading>Radius</SubHeading>
          <Card padding="md">
            <div className="flex flex-wrap gap-6">
              {RADIUS_TOKENS.map((r) => (
                <div key={r.name} className="flex flex-col items-center gap-2">
                  <div
                    className="h-14 w-14 border border-border bg-surface-muted"
                    style={{ borderRadius: r.px }}
                  />
                  <span className="text-xs text-muted">
                    {r.name} · {r.px}px
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        <Section id="atoms" title="Atoms" description="가장 작은 단위의 재사용 요소.">
          <SubHeading>Badge</SubHeading>
          <Card padding="md">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="allow">allow</Badge>
              <Badge tone="transform">transform</Badge>
              <Badge tone="block">block</Badge>
              <Badge tone="primary">승인</Badge>
              <Badge tone="neutral">중립</Badge>
            </div>
          </Card>

          <SubHeading>Chip</SubHeading>
          <Card padding="md">
            <div className="flex flex-wrap items-center gap-2">
              <Chip>기본 숫자</Chip>
              <Chip>카드번호 12</Chip>
              <Chip tone="transform">위험도 0.72 &gt; 기준선 0.60</Chip>
              <Chip tone="block">정책 위반</Chip>
            </div>
          </Card>

          <SubHeading>StatusDot</SubHeading>
          <Card padding="md">
            <div className="flex flex-wrap items-center gap-5 text-sm text-body">
              {(['allow', 'transform', 'block', 'primary', 'neutral'] as Tone[]).map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <StatusDot tone={t} />
                  {t}
                </div>
              ))}
            </div>
          </Card>

          <SubHeading>Toggle</SubHeading>
          <Card padding="md">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-body">ON/OFF 버튼1</span>
                <Toggle checked={toggleA} onChange={setToggleA} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-body">ON/OFF 버튼2</span>
                <Toggle checked={toggleB} onChange={setToggleB} />
              </div>
            </div>
          </Card>

          <SubHeading>SegmentedControl</SubHeading>
          <Card padding="md">
            <div className="max-w-xs">
              <SegmentedControl
                value={period}
                onChange={setPeriod}
                options={[
                  { value: '15m', label: '15분' },
                  { value: '1h', label: '1시간' },
                  { value: '6h', label: '6시간' },
                ]}
              />
            </div>
          </Card>

          <SubHeading>PillTabs</SubHeading>
          <Card padding="md">
            <PillTabs
              value={tab}
              onChange={setTab}
              options={[
                { value: 'overview', label: '개요' },
                { value: 'events', label: '이벤트 & 드릴다운' },
              ]}
            />
          </Card>
        </Section>

        <Section id="molecules" title="Molecules" description="Atom을 조합한 입력·통계 단위.">
          <SubHeading>MetricCard</SubHeading>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricCard
              label="총 판정 수"
              value="11,757"
              unit="건"
              delta="+8.2%"
              caption="직전 1시간 대비"
            />
            <MetricCard
              label="토큰화 엔티티"
              value="6,940"
              unit="건"
              caption="주민번호 2,104건 최다"
            />
            <MetricCard label="p95 지연시간" value="418" unit="ms" caption="목표 600ms 이내" progress={69.6} />
          </div>

          <SubHeading>DistributionBar</SubHeading>
          <Card padding="md">
            <div className="flex flex-col gap-2">
              <DistributionBar label="토큰화" value="6,940" share="59.0" pct={100} highlight />
              <DistributionBar label="조치 없음" value="8,412" share="71.5" pct={71} />
              <DistributionBar label="요청 차단" value="318" share="2.7" pct={3} />
            </div>
          </Card>

          <SubHeading>FilterRow</SubHeading>
          <Card padding="md">
            <div className="flex max-w-xs flex-col gap-1">
              <FilterRow
                label="allow"
                count="8,412"
                dotTone="allow"
                checked={filters.allow}
                onChange={(v) => setFilters((f) => ({ ...f, allow: v }))}
              />
              <FilterRow
                label="transform"
                count="3,027"
                dotTone="transform"
                checked={filters.transform}
                onChange={(v) => setFilters((f) => ({ ...f, transform: v }))}
              />
              <FilterRow
                label="block"
                count="318"
                dotTone="block"
                checked={filters.block}
                onChange={(v) => setFilters((f) => ({ ...f, block: v }))}
              />
            </div>
          </Card>

          <SubHeading>SearchInput</SubHeading>
          <Card padding="md">
            <div className="max-w-xs">
              <SearchInput value={search} onChange={setSearch} placeholder="--- 로 검색" />
            </div>
          </Card>
        </Section>

        <Section id="organisms" title="Organisms" description="화면을 구성하는 복합 컨테이너.">
          <SubHeading>Card variants</SubHeading>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card variant="surface" padding="md">
              <div className="text-sm font-semibold text-muted">surface</div>
              <div className="mt-2 text-xs text-faint">기본 흰 카드 · rounded-xl</div>
            </Card>
            <Card variant="subtle" padding="md">
              <div className="text-sm font-semibold text-muted">subtle</div>
              <div className="mt-2 text-xs text-faint">중첩 패널 · rounded-lg</div>
            </Card>
            <Card variant="dangerSubtle" padding="md">
              <div className="text-sm font-semibold text-muted">dangerSubtle</div>
              <div className="mt-2 text-xs text-faint">block 이벤트 강조 · rounded-lg</div>
            </Card>
          </div>

          <SubHeading>Table</SubHeading>
          <Card padding="none" className="overflow-hidden">
            <Table>
              <thead>
                <tr>
                  <Th>시각</Th>
                  <Th>세션</Th>
                  <Th>판정</Th>
                  <Th align="right">지연 (ms)</Th>
                </tr>
              </thead>
              <tbody>
                <Tr onClick={() => {}}>
                  <Td>14:32:07</Td>
                  <Td>sess_8f31c2ab</Td>
                  <Td>
                    <Badge tone="block">block</Badge>
                  </Td>
                  <Td align="right">512</Td>
                </Tr>
                <Tr onClick={() => {}}>
                  <Td>14:32:04</Td>
                  <Td>sess_2c90de41</Td>
                  <Td>
                    <Badge tone="transform">transform</Badge>
                  </Td>
                  <Td align="right">388</Td>
                </Tr>
                <Tr onClick={() => {}}>
                  <Td>14:32:01</Td>
                  <Td>sess_74ab13f0</Td>
                  <Td>
                    <Badge tone="allow">allow</Badge>
                  </Td>
                  <Td align="right">214</Td>
                </Tr>
              </tbody>
            </Table>
          </Card>
        </Section>
      </div>
    </div>
  )
}
