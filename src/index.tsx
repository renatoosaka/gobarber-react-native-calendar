/* eslint-disable react/prop-types */
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  LayoutChangeEvent,
  TouchableOpacity,
} from 'react-native';

import leftImg from './assets/left.png';
import rightImg from './assets/right.png';

const { width } = Dimensions.get('window');

const CONTAINER_WIDTH = width / 7;

const defaultWeekNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const defaultMonthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const defaultColors = {
  background: '#fff',
  header: {
    background: '#7159c1',
    text: '#fff',
  },
  week: {
    text: '#7e7e7e',
  },
  day: {
    disabled: {
      background: 'transparent',
      text: '#cecece',
    },
    enabled: {
      background: '#f3f3f3',
      text: '#3f3f3f',
    },
    highlight: {
      background: '#7159c1',
      text: '#fff',
    },
  },
};

interface CalendarProps {
  fontFamily?: string;
  colors?: {
    background?: string;
    header?: {
      background?: string;
      text?: string;
    };
    week?: {
      text: string;
    };
    day?: {
      disabled?: {
        background?: string;
        text?: string;
      };
      enabled?: {
        background?: string;
        text?: string;
      };
      highlight?: {
        background?: string;
        text?: string;
      };
    };
  };
  disableDays?: {
    weekDays?: Array<number>;
    days?: Array<Date>;
  };
  weekNames?: Array<string>;
  monthNames?: Array<string>;
  enabledPastDate?: boolean;
  onMonthChange?: (date: Date) => void;
  onSelectDate?: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  disableDays = { weekDays: [], days: [] },
  weekNames = defaultWeekNames,
  monthNames = defaultMonthNames,
  enabledPastDate = true,
  fontFamily = 'Roboto',
  colors = defaultColors,
  onMonthChange,
  onSelectDate,
}) => {
  const [containerWidth, setContainerWidth] = useState(CONTAINER_WIDTH);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const handleOnLayout = useCallback((event: LayoutChangeEvent) => {
    const { width: layoutWidth } = event.nativeEvent.layout;
    setContainerWidth((layoutWidth - 16) / 7);
  }, []);

  const weeksInMonth = useCallback((array: Array<number> = [], size = 7): Array<
    Array<number>
  > => {
    if (!array.length) {
      return [];
    }
    const head = array.slice(0, size);
    const tail = array.slice(size);

    return [head, ...weeksInMonth(tail, size)];
  }, []);

  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedMonth, selectedYear]);

  const startWeekDayOfMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 1).getDay();
  }, [selectedMonth, selectedYear]);

  const monthDays = useMemo(
    () =>
      weeksInMonth(
        Array.from({ length: daysInMonth + startWeekDayOfMonth }, (_, index) =>
          index < startWeekDayOfMonth ? 0 : index + 1 - startWeekDayOfMonth,
        ),
      ),
    [daysInMonth, startWeekDayOfMonth, weeksInMonth],
  );

  const nextMonth = useCallback(() => {
    let year = selectedYear;
    let month = selectedMonth;

    if (selectedMonth === 11) {
      year += 1;
      month = 0;
    } else {
      month += 1;
    }

    const today = new Date();

    setSelectedYear(year);
    setSelectedMonth(month);
    setSelectedDay(
      year === today.getFullYear() && month === today.getMonth()
        ? today.getDate()
        : 1,
    );

    onMonthChange && onMonthChange(new Date(year, month, 1));
  }, [onMonthChange, selectedMonth, selectedYear]);

  const previousMonth = useCallback(() => {
    let year = selectedYear;
    let month = selectedMonth;

    if (selectedMonth === 0) {
      year -= 1;
      month = 11;
    } else {
      month -= 1;
    }

    const today = new Date();

    setSelectedYear(year);
    setSelectedMonth(month);
    setSelectedDay(
      year === today.getFullYear() && month === today.getMonth()
        ? today.getDate()
        : 1,
    );

    onMonthChange && onMonthChange(new Date(year, month, 1));
  }, [onMonthChange, selectedMonth, selectedYear]);

  const selectedMonthText = useMemo(() => monthNames[selectedMonth], [
    monthNames,
    selectedMonth,
  ]);

  const isDisabledDay = useCallback(
    (weekDay: number, day: number) => {
      let disabled = false;

      if (disableDays || !enabledPastDate) {
        if (disableDays.weekDays) {
          disabled = disabled || disableDays.weekDays.includes(weekDay);
        }

        if (disableDays.days) {
          disabled =
            disabled ||
            !!disableDays.days.find(
              date =>
                date.getDate() === day &&
                date.getMonth() === selectedMonth &&
                date.getFullYear() === selectedYear,
            );
        }

        if (!enabledPastDate) {
          const today = new Date();
          disabled =
            disabled ||
            new Date(selectedYear, selectedMonth, day).getTime() <
              today.setDate(today.getDate() - 1);
        }
      }

      return disabled;
    },
    [disableDays, selectedMonth, selectedYear, enabledPastDate],
  );

  const handleSelectDay = useCallback(
    (weekDay: number, day: number) => {
      if (isDisabledDay(weekDay, day)) {
        return;
      }

      setSelectedDay(day);

      if (onSelectDate) {
        onSelectDate(new Date(selectedYear, selectedMonth, day));
      }
    },
    [isDisabledDay, onSelectDate, selectedMonth, selectedYear],
  );

  const isShowPreviousMonth = useMemo(() => {
    if (!enabledPastDate) {
      const today = new Date();

      return (
        (selectedMonth > today.getMonth() &&
          selectedYear === today.getFullYear()) ||
        selectedYear > today.getFullYear()
      );
    }

    return true;
  }, [selectedMonth, selectedYear, enabledPastDate]);

  const componentColors = useMemo(() => ({ ...defaultColors, ...colors }), [
    colors,
  ]);

  return (
    <View
      style={[styles.calendar, { backgroundColor: componentColors.background }]}
      onLayout={handleOnLayout}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: componentColors.header?.background },
        ]}
      >
        <TouchableOpacity
          style={styles.headerButton}
          onPress={previousMonth}
          disabled={!isShowPreviousMonth}
        >
          {isShowPreviousMonth && <Image source={leftImg} />}
        </TouchableOpacity>

        <Text
          style={[
            styles.title,
            { color: componentColors.header?.text, fontFamily },
          ]}
        >
          {`${selectedMonthText} ${selectedYear}`}
        </Text>

        <TouchableOpacity style={styles.headerButton} onPress={nextMonth}>
          <Image source={rightImg} />
        </TouchableOpacity>
      </View>

      <View style={{ marginHorizontal: 8, marginBottom: 8 }}>
        <View style={styles.row}>
          {Array.from({ length: 7 }, (_, index) => index).map(week => (
            <View
              key={week}
              style={[styles.container, { width: containerWidth, height: 32 }]}
            >
              <Text style={[styles.weekTitle, { fontFamily }]}>
                {weekNames[week]}
              </Text>
            </View>
          ))}
        </View>

        {monthDays.map((week, index) => (
          <View key={index} style={styles.row}>
            {week.map((day, indexDay) => (
              <View
                key={`${day}-${indexDay}-${index}`}
                style={styles.container}
              >
                <TouchableOpacity
                  activeOpacity={isDisabledDay(indexDay, day) ? 1 : 0.5}
                  style={[
                    styles.dayContainer,
                    {
                      backgroundColor:
                        day === 0 || isDisabledDay(indexDay, day)
                          ? componentColors.day?.disabled?.background
                          : componentColors.day?.enabled?.background,
                      width: containerWidth - 8,
                      height: containerWidth - 8,
                    },
                    day === selectedDay
                      ? {
                          backgroundColor:
                            componentColors.day?.highlight?.background,
                        }
                      : [],
                  ]}
                  onPress={() => handleSelectDay(indexDay, day)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      {
                        fontFamily,
                        color: isDisabledDay(indexDay, day)
                          ? componentColors.day?.disabled?.text
                          : componentColors.day?.enabled?.text,
                      },
                      day === selectedDay
                        ? { color: componentColors.day?.highlight?.text }
                        : [],
                    ]}
                  >
                    {!!day && day}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendar: {
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  header: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: '#7159c1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    height: 40,
  },
  headerButton: {
    paddingHorizontal: 16,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  weekTitle: {
    color: '#7e7e7e',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dayContainer: {
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    color: '#3f3f3f',
    fontSize: 16,
    fontWeight: 'bold',
  },
  daySelected: {
    backgroundColor: 'gold',
  },
});

export default Calendar;
