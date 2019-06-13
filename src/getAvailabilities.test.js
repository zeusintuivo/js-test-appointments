import knex from "knexClient"
import getAvailabilities from "./getAvailabilities"

const checkEmptyList = async (numberOfDays, fromDate, toDate) => {
    const availabilities = await getAvailabilities(new Date(fromDate), numberOfDays)

    expect(availabilities.length).toBe(numberOfDays)
    expect(String(availabilities[0].date)).toBe(
        String(new Date(fromDate))
    )
    expect(String(availabilities[numberOfDays - 1].date)).toBe(
        String(new Date(toDate))
    )
    for (let i = 0; i < numberOfDays; ++i) {
        expect(availabilities[i].slots).toEqual([])
    }
}

describe("getAvailabilities", () => {
    beforeEach(() => knex("events").truncate())
    describe("checks truncated empty response", () => {
        it("should return empty every day from 10th to 17th", async () => {
            checkEmptyList(8, "2014-08-10", "2014-08-17")
        })
    })

    describe("makes appointment after recurring day", () => {
        beforeEach(async () => {
            await knex("events").insert([
                {
                    kind: "appointment",
                    starts_at: new Date("2014-08-11 10:30"),
                    ends_at: new Date("2014-08-11 11:30")
                },
                {
                    kind: "opening",
                    starts_at: new Date("2014-08-04 09:30"),
                    ends_at: new Date("2014-08-04 12:30"),
                    weekly_recurring: true
                }
            ])
        })
        it("handles null date", async () => {
            const availabilities = await getAvailabilities(null, 7)
            expect(availabilities).toEqual(
                [ { date: "Invalid Date", week_day: null, slots: [] } ])
            expect(availabilities[0].slots).toEqual([])
        })
        it("handles null for openning", async () => {
            const availabilities = await getAvailabilities(new Date("2014-08-04 09:30"), null)
            expect(availabilities.length).toEqual(7)
            expect(availabilities[0].slots).toEqual([ "9:30", "10:00", "10:30", "11:00", "11:30", "12:00" ])
        })
        it("handles null for appointment", async () => {
            const availabilities = await getAvailabilities(new Date("2014-08-11 09:30"), null)
            expect(availabilities.length).toEqual(7)
            expect(availabilities[0].slots).toEqual([ "9:30", "10:00", "11:30", "12:00" ])
        })
        it("handles invalid Date", async () => {
            const availabilities = await getAvailabilities(new Date("2014-02-29 09:30"), 2)
            expect(availabilities[0].slots).toEqual([])
        })
        it("minimum response is 7 days", async () => {
            const availabilities = await getAvailabilities(new Date("2014-08-11 09:30"), 1)
            expect(availabilities.length).toEqual(7)
        })
        it("handles decimal", async () => {
            const availabilities = await getAvailabilities(new Date("2014-08-11 09:30"), 1.1)
            expect(availabilities.length).toEqual(7)
        })
        it("converts string to number", async () => {
            const availabilities = await getAvailabilities(new Date("2014-08-11 09:30"), "9")
            expect(availabilities.length).toEqual(9)
        })
        it("opens recurring and reserves only one day ", async () => {
            const availabilities = await getAvailabilities(new Date("2014-08-11"), 8)
            expect(availabilities[0].slots).toEqual([
                "9:30",
                "10:00",
                "11:30",
                "12:00"
            ])
            expect(availabilities[7].slots).toEqual([
                "9:30",
                "10:00",
                "10:30",
                "11:00",
                "11:30",
                "12:00"
            ])
        })
    })

    describe("not found", () => {
        it("returns list of empty availabilities", async () => {
            checkEmptyList(9, "2016-05-11", "2016-05-19")
        })
    })

    describe("does not make recurring event", () => {
        beforeEach(async () => {
            await knex("events").insert([
                {
                    kind: "appointment",
                    starts_at: new Date("2018-10-22 10:30"),
                    ends_at: new Date("2018-10-22 11:30")
                },
                {
                    kind: "opening",
                    starts_at: new Date("2018-10-04 09:30"),
                    ends_at: new Date("2018-10-04 12:30"),
                    weekly_recurring: false
                }
            ])
        })

        it("returns empty when not found", async () => {
            checkEmptyList(10, "2014-08-11", "2014-08-20")
        })

        it("no appointment without openning", async () => {
            const availabilities = await getAvailabilities(new Date("2018-10-22"), 4)
            expect(availabilities[0].slots).toEqual([])
        })

    })
})
