package main

import (
	"fmt"
)

func daonguochuoi(n string) string {
    runes := []rune(n)
    
    return string(runes)
}

func main() {
    fmt.Println(daonguochuoi("hello"))
}
