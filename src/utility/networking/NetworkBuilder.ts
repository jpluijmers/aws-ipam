import {Subnet} from "./Subnet";

/**
 * Helper class for building subnet classes.
 */
export class NetworkBuilder {
    static cidrRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/;

    /**
     * Factory method for generating subnet objects from stored CIDR strings.
     *
     * @param cidr
     */
    static fromCidr(cidr: string): Subnet {
        this.assertIsValidCidr(cidr);

        const parts = cidr.match(this.cidrRegex) || [];
        let address = parseInt(parts[1]) * 16777216 + parseInt(parts[2]) * 65536 + parseInt(parts[3]) * 256 + parseInt(parts[4]);
        const mask = this.mask(parseInt(parts[5]));
        const wildcard = this.mask(32) - mask;

        address = address & mask;

        return new Subnet(address, mask,wildcard);
    }

    /**
     * Factory method for generating subnets from address and mask numbers.
     *
     * @param address
     * @param mask
     */
    static fromInt(address: number, mask: number){
        const wildcard = this.mask(32) - mask;;

        address = address & mask;

        return new Subnet(address, mask,wildcard);
    }

    /**
     * Utility method for generating network masks according to the /suffix.
     *
     * @param suffix
     */
    static mask(suffix: number): number {
        return (Math.pow(2, suffix) - 1) << (32 - suffix);
    }

    /**
     * Helper function to check if a CIDR is correctly formatted.
     *
     * @param cidr
     */
    static assertIsValidCidr(cidr: string) {
        const tester = new RegExp(this.cidrRegex);
        const validFormat = tester.test(cidr);

        if ( !validFormat ){
            throw new Error(`CIDR: ${cidr} is not properly formatted`);
        }

        const parts = cidr.match(this.cidrRegex) || [];
        for ( var octet = 1; octet <= 4; octet += 1 ){
            if ( parseInt(parts[octet]) > 255 ){
                throw new Error(`Octet ${octet} for ${cidr} is over 255.`)
            }
        }
        if ( parseInt(parts[5]) > 32){
            throw new Error(`The bitmask for ${cidr} is over 32.`)
        }
    }
}