package main

import (
	"fmt"
)

func check(a int) bool {
    if a < 2 {
        return false
    }

    for i := 2; i*i <= a; i++ {
        if a%i == 0 {
            return false
        }
    }
    return true
}

func printPrimes() {
    for i := 1; i <= 100; i++ {
        if check(i) {
            fmt.Println(i)
        }
    }
}