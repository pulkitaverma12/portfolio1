import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const WEEKS_IN_YEAR = 53;
const DAYS_IN_WEEK = 7;
const JANUARY_MONTH = 0;
const DECEMBER_MONTH = 11;
const SUNDAY_DAY = 0;
const MIN_WEEKS_FOR_DECEMBER_HEADER = 2;
const TOOLTIP_OFFSET_X = 10;
const TOOLTIP_OFFSET_Y = 40;

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const LEVEL_0 = 0;
const LEVEL_1 = 1;
const LEVEL_2 = 2;
const LEVEL_3 = 3;
const LEVEL_4 = 4;
const CONTRIBUTION_LEVELS = [LEVEL_0, LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4];
const DAY_1 = 1;
const DAY_31 = 31;

const getProfileUrl = (githubUsername, githubProfileUrl) =>
  githubProfileUrl || (githubUsername ? `https://github.com/${githubUsername}` : 'https://github.com');

const mapCountToLevel = (count) => {
  if (count <= 0) return LEVEL_0;
  if (count <= 2) return LEVEL_1;
  if (count <= 5) return LEVEL_2;
  if (count <= 9) return LEVEL_3;
  return LEVEL_4;
};

const normalizeLevel = (level, count) => {
  if (Number.isFinite(Number(level))) {
    return Math.max(LEVEL_0, Math.min(LEVEL_4, Number(level)));
  }

  if (typeof level === 'string') {
    const normalizedKey = level.toUpperCase();
    const levelMap = {
      NONE: LEVEL_0,
      FIRST_QUARTILE: LEVEL_1,
      SECOND_QUARTILE: LEVEL_2,
      THIRD_QUARTILE: LEVEL_3,
      FOURTH_QUARTILE: LEVEL_4
    };
    if (Object.prototype.hasOwnProperty.call(levelMap, normalizedKey)) {
      return levelMap[normalizedKey];
    }
  }

  return mapCountToLevel(count);
};

const normalizeEntry = (entry) => {
  const date = typeof entry?.date === 'string' ? entry.date.split('T')[0] : '';
  const count = Number(entry?.count ?? entry?.contributionCount ?? entry?.value ?? 0);
  const safeCount = Number.isFinite(count) && count > 0 ? count : LEVEL_0;

  return {
    date,
    count: safeCount,
    level: normalizeLevel(entry?.level ?? entry?.contributionLevel ?? entry?.intensity, safeCount)
  };
};

const extractContributionData = (payload, year) => {
  const candidates = [
    payload?.contributions,
    payload?.data?.contributions,
    payload?.yearlyContributions,
    payload?.days,
    payload?.contributionCalendar?.days,
    payload?.contributionCalendar?.contributions
  ];

  const graphQlWeeks =
    payload?.contributionsCollection?.contributionCalendar?.weeks ||
    payload?.data?.user?.contributionsCollection?.contributionCalendar?.weeks;

  if (Array.isArray(graphQlWeeks)) {
    const flattened = graphQlWeeks.flatMap((week) => week?.contributionDays || []);
    candidates.push(flattened);
  }

  const firstValidList = candidates.find((candidate) => Array.isArray(candidate) && candidate.length > 0) || [];

  return firstValidList
    .map(normalizeEntry)
    .filter((entry) => entry.date.startsWith(String(year)));
};

const isDateInValidRange = (currentDate, startDate, endDate, targetYear) => {
  const isInRange = currentDate >= startDate && currentDate <= endDate;
  const isPreviousYearDecember =
    currentDate.getFullYear() === targetYear - 1 &&
    currentDate.getMonth() === DECEMBER_MONTH;
  const isNextYearJanuary =
    currentDate.getFullYear() === targetYear + 1 &&
    currentDate.getMonth() === JANUARY_MONTH;
  return isInRange || isPreviousYearDecember || isNextYearJanuary;
};

const createDayData = (currentDate, dataByDate) => {
  const dateString = currentDate.toISOString().split('T')[0];
  const existingData = dataByDate.get(dateString);
  return {
    date: dateString,
    count: existingData?.count ?? LEVEL_0,
    level: existingData?.level ?? LEVEL_0
  };
};

const shouldShowMonthHeader = ({
  currentYear,
  targetYear,
  currentMonth,
  startDateDay,
  weekCount
}) =>
  currentYear === targetYear ||
  (currentYear === targetYear - 1 &&
    currentMonth === DECEMBER_MONTH &&
    startDateDay !== SUNDAY_DAY &&
    weekCount >= MIN_WEEKS_FOR_DECEMBER_HEADER);

const calculateMonthHeaders = (targetYear) => {
  const headers = [];
  const startDate = new Date(targetYear, JANUARY_MONTH, DAY_1);
  const firstSunday = new Date(startDate);
  firstSunday.setDate(startDate.getDate() - startDate.getDay());

  let currentMonth = -1;
  let currentYear = -1;
  let monthStartWeek = 0;
  let weekCount = 0;

  for (let weekNumber = 0; weekNumber < WEEKS_IN_YEAR; weekNumber++) {
    const weekDate = new Date(firstSunday);
    weekDate.setDate(firstSunday.getDate() + weekNumber * DAYS_IN_WEEK);

    const monthKey = weekDate.getMonth();
    const yearKey = weekDate.getFullYear();

    if (monthKey !== currentMonth || yearKey !== currentYear) {
      if (
        currentMonth !== -1 &&
        shouldShowMonthHeader({
          currentYear,
          targetYear,
          currentMonth,
          startDateDay: startDate.getDay(),
          weekCount
        })
      ) {
        headers.push({
          month: MONTHS[currentMonth],
          colspan: weekCount,
          startWeek: monthStartWeek
        });
      }

      currentMonth = monthKey;
      currentYear = yearKey;
      monthStartWeek = weekNumber;
      weekCount = 1;
    } else {
      weekCount++;
    }
  }

  if (
    currentMonth !== -1 &&
    shouldShowMonthHeader({
      currentYear,
      targetYear,
      currentMonth,
      startDateDay: startDate.getDay(),
      weekCount
    })
  ) {
    headers.push({
      month: MONTHS[currentMonth],
      colspan: weekCount,
      startWeek: monthStartWeek
    });
  }

  return headers;
};

const GitHubActivityGraph = ({
  githubUsername,
  githubProfileUrl,
  className = '',
  data = [],
  showLegend = true,
  showTooltips = true,
  year = new Date().getFullYear()
}) => {
  const [remoteData, setRemoteData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [fetchError, setFetchError] = useState('');
  const shouldReduceMotion = useReducedMotion();

  const profileUrl = useMemo(
    () => getProfileUrl(githubUsername, githubProfileUrl),
    [githubProfileUrl, githubUsername]
  );

  useEffect(() => {
    let isMounted = true;

    if (Array.isArray(data) && data.length > 0) {
      setRemoteData([]);
      setFetchError('');
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    if (!githubUsername) {
      setRemoteData([]);
      setFetchError('GitHub username not provided.');
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const fetchContributions = async () => {
      setIsLoading(true);
      setFetchError('');

      try {
        const response = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${githubUsername}?y=${year}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch contribution data');
        }

        const payload = await response.json();
        const parsedData = extractContributionData(payload, year);

        if (isMounted) {
          setRemoteData(parsedData);
          if (parsedData.length === 0) {
            setFetchError('No contribution data available for this year yet.');
          }
        }
      } catch (error) {
        if (isMounted) {
          setRemoteData([]);
          setFetchError('Live contribution data is unavailable right now.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchContributions();

    return () => {
      isMounted = false;
    };
  }, [data, githubUsername, year]);

  const contributionData = data.length > 0 ? data : remoteData;

  const dataByDate = useMemo(() => {
    const map = new Map();
    contributionData.forEach((entry) => {
      if (entry?.date) {
        map.set(entry.date, {
          count: entry.count ?? LEVEL_0,
          level: Math.max(LEVEL_0, Math.min(LEVEL_4, entry.level ?? LEVEL_0))
        });
      }
    });
    return map;
  }, [contributionData]);

  const yearData = useMemo(() => {
    const startDate = new Date(year, JANUARY_MONTH, DAY_1);
    const endDate = new Date(year, DECEMBER_MONTH, DAY_31);
    const days = [];

    const firstSunday = new Date(startDate);
    firstSunday.setDate(startDate.getDate() - startDate.getDay());

    for (let weekNum = 0; weekNum < WEEKS_IN_YEAR; weekNum++) {
      for (let day = 0; day < DAYS_IN_WEEK; day++) {
        const currentDate = new Date(firstSunday);
        currentDate.setDate(
          firstSunday.getDate() + weekNum * DAYS_IN_WEEK + day
        );

        if (isDateInValidRange(currentDate, startDate, endDate, year)) {
          days.push(createDayData(currentDate, dataByDate));
        } else {
          days.push({
            date: '',
            count: LEVEL_0,
            level: LEVEL_0
          });
        }
      }
    }

    return days;
  }, [dataByDate, year]);

  const monthHeaders = useMemo(() => calculateMonthHeaders(year), [year]);

  const handleDayHover = (day, event) => {
    if (showTooltips && day.date) {
      setHoveredDay(day);
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseMove = (event) => {
    if (hoveredDay) {
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleDayLeave = () => {
    setHoveredDay(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return '';
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getContributionText = (count) => {
    if (count === LEVEL_0) {
      return 'No contributions';
    }
    if (count === LEVEL_1) {
      return '1 contribution';
    }
    return `${count} contributions`;
  };

  return (
    <section className={`activity-shell hover-target ${className}`.trim()} aria-label="GitHub activity graph">
      <div className="activity-header-row">
        <h3>Activity Graph</h3>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open GitHub profile"
        >
          @{githubUsername || 'github'}
        </a>
      </div>

      <div className="activity-board" aria-label="GitHub profile activity graph">
        <div className="contribution-graph" onMouseMove={handleMouseMove}>
          <div className="activity-graph-scroll">
            <table className="contribution-table">
              <caption className="visually-hidden">Contribution Graph for {year}</caption>

              <thead>
                <tr>
                  <td className="contribution-spacer-cell" />
                  {monthHeaders.map((header) => (
                    <td
                      className="contribution-month-header"
                      colSpan={header.colspan}
                      key={`${header.month}-${header.startWeek}`}
                    >
                      <span>{header.month}</span>
                    </td>
                  ))}
                </tr>
              </thead>

              <tbody>
                {Array.from({ length: DAYS_IN_WEEK }, (_, dayIndex) => (
                  <tr key={DAYS[dayIndex]}>
                    <td className="contribution-day-label-cell">
                      {dayIndex % 2 === 0 && (
                        <span className="contribution-day-label">
                          {DAYS[dayIndex]}
                        </span>
                      )}
                    </td>

                    {Array.from({ length: WEEKS_IN_YEAR }, (_, weekIndex) => {
                      const dayData = yearData[weekIndex * DAYS_IN_WEEK + dayIndex];
                      const cellKey = `${dayData?.date || 'empty'}-${weekIndex}-${dayIndex}`;

                      if (!dayData?.date) {
                        return (
                          <td className="contribution-cell" key={cellKey}>
                            <div className="contribution-cell-square empty" />
                          </td>
                        );
                      }

                      return (
                        <td
                          className="contribution-cell"
                          key={cellKey}
                          onMouseEnter={(event) => handleDayHover(dayData, event)}
                          onMouseLeave={handleDayLeave}
                          title={
                            showTooltips
                              ? `${formatDate(dayData.date)}: ${getContributionText(dayData.count)}`
                              : undefined
                          }
                        >
                          <div
                            className={`contribution-cell-square level-${dayData.level}`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AnimatePresence>
            {showTooltips && hoveredDay && (
              <motion.div
                animate={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : { opacity: 1, scale: 1 }
                }
                className="contribution-tooltip"
                exit={
                  shouldReduceMotion
                    ? { opacity: 0, transition: { duration: 0 } }
                    : { opacity: 0, scale: 0.9 }
                }
                initial={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : { opacity: 0, scale: 0.9 }
                }
                style={{
                  left: tooltipPosition.x + TOOLTIP_OFFSET_X,
                  top: tooltipPosition.y - TOOLTIP_OFFSET_Y
                }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
              >
                <div className="tooltip-title">
                  {getContributionText(hoveredDay.count)}
                </div>
                <div className="tooltip-date">
                  {formatDate(hoveredDay.date)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {showLegend && (
          <div className="contribution-legend-row">
            <span>Less</span>
            <div className="contribution-legend-scale">
              {CONTRIBUTION_LEVELS.map((level) => (
                <div
                  className={`contribution-cell-square level-${level}`}
                  key={level}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        )}

        {fetchError && !isLoading && (
          <p className="activity-status" role="status">
            {`${fetchError} Open profile for live details.`}
          </p>
        )}
      </div>
    </section>
  );
};

export default GitHubActivityGraph;
