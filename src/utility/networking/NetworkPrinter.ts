import {Subnet} from "./Subnet";

/**
 * Helper for printing / formatting info about Subnets.
 */
export class NetworkPrinter{

    /**
     * Print debug info about the subnet including binary.
     *
     * @param network
     */
    static printDebug(network: Subnet): string{
        const formattedIp = this.formatIp(network.getAddress());
        const binaryIp = this.formatBinary(network.getAddress());
        const formattedMask = this.formatIp(network.getMask());
        const binaryMask = this.formatBinary(network.getMask());
        const formattedWildcard = this.formatIp(network.getWildcard());
        const binaryWildcard = this.formatBinary(network.getWildcard());

        return `${formattedIp} ${binaryIp} ${formattedMask} ${binaryMask} ${formattedWildcard} ${binaryWildcard}`;
    }

    /**
     * Nice multiline dump of the subnet.
     *
     * @param network
     */
    static printPretty( network: Subnet): string{

        const formattedIp = this.formatIp(network.getAddress());
        const formattedMask = this.formatIp(network.getMask());
        const lower = this.formatIp(network.getLowerBound());
        const upper = this.formatIp(network.getUpperBound());
        const broadcast = this.formatIp(network.getUpperBound());
        const hosts = network.getWildcard();

        var result = `network: ${formattedIp}\n`;
        result += `netmask: ${formattedMask}\n`;
        result += `range: ${lower} - ${upper}\n`;
        result += `broadcast: ${broadcast}\n`;
        result += `hosts: ${hosts}`;
        return result;
    }

    static printRange(network: Subnet): string{
        const lower = this.formatIp(network.getLowerBound());
        const upper = this.formatIp(network.getUpperBound());
        return `${lower} - ${upper}`;
    }

    /**
     * Format decimal as 32bit binary number.
     *
     * @param decimal
     */
    static formatBinary( decimal: number): string{
        return (decimal >>> 0).toString(2).padStart(32, '0');
    }

    /**
     * Format decimal to text ip address like 0.0.0.0
     *
     * @param decimal
     */
    static formatIp( decimal: number): string{
        return [decimal >>> 24, decimal >>> 16 & 0xFF, decimal >>> 8 & 0xFF, decimal & 0xFF].join('.');
    }

    /**
     * Format subnet as CIDR like: 0.0.0.0/0
     *
     * @param network
     */
    static formatCidr(network: Subnet): string{
        return this.formatIp(network.getAddress())  + '/' + network.getMaskBits();
    }
}