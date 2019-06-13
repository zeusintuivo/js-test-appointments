import moment from "moment"
import knex from "knexClient"

const iterateEvents = (event, availabilities, callback) => {
    for (
        let date = moment(event.starts_at);
        date.isBefore(event.ends_at);
        date.add(30, "minutes")
    ) {
        if (event.weekly_recurring) {
            const targetWeekDay = +date.format("d")
            for (const availability of availabilities) {
                if (availability[1].week_day === targetWeekDay) {
                    callback(availability[1], date)
                }
            }
        } else {
            const dayOfTheYear = +date.dayOfYear()
            const day = availabilities.get(dayOfTheYear)
            callback(day, date)
        }
    }
}

const processEvents = (events, type, availabilities, callback) => {
    for (const event of events) {
        if (event.kind === type) {
            iterateEvents(event, availabilities, callback)
        }
    }
}

const substractHours = (day, date) => {
    day.slots = day.slots.filter(
        slot => slot.indexOf(date.format("H:mm")) === -1
    )
}

const queryEvents = (date) => knex
    .select("kind", "starts_at", "ends_at", "weekly_recurring")
    .from("events")
    .where(function() {
        this.where("weekly_recurring", true).orWhere("ends_at", ">", +date)
    })

const availabilitiesTemplate = (difference, targetDate) => {
    const availabilities = new Map()
    for (let i = 0; i < difference; ++i) {
        const dateWithIncreasedDays = moment(targetDate).add(i, "days")
        const dayOfYear = dateWithIncreasedDays.dayOfYear()
        availabilities.set(+dayOfYear, {
            date: dateWithIncreasedDays.toDate(),
            week_day: +dateWithIncreasedDays.format("d"),
            slots: []
        })
    }
    return availabilities
}

export default async function getAvailabilities(date, numberOfDays = 7) {
    let daysAsked = +numberOfDays
    if (!daysAsked || daysAsked < 7) daysAsked = 7
    let validDate = moment(date).isValid()
    if (!validDate) return [ { date: "Invalid Date", week_day: null, slots: [] } ]
    const events = await queryEvents(date)
    const availabilities = availabilitiesTemplate(daysAsked, date)
    processEvents(events, "opening", availabilities, (day, passedDate) => {
        if (day) day.slots.push(passedDate.format("H:mm"))
    }
    )
    processEvents(events, "appointment", availabilities, (day, passedDate) => {
        if (day) substractHours(day, passedDate)
    }
    )
    return Array.from(availabilities.values())
}
