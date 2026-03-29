package main


func checkPrime(a int) bool {
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
 
